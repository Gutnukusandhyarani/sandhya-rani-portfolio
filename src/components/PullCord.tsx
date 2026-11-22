import { useEffect, useRef, useState } from 'react';
import { toggleTheme, useTheme, prefersReducedMotion } from '../lib/theme';

/**
 * The signature interaction: a ball-chain pull cord hanging from the top-right edge.
 * Grab the handle (or anywhere on the chain), pull down and let go to flip the lights.
 *
 * - A natural ~55px pull is enough; the handle lights up and says "Release" when it will switch.
 * - A quick downward flick also counts, and a simple tap / Enter / Space pulls it for you.
 * - The knob tracks the pointer almost 1:1, so it feels attached to your hand.
 *
 * Physics: a damped spring returns the knob to rest; sideways it swings like a pendulum.
 * Everything is written straight to the DOM inside one requestAnimationFrame loop,
 * which sleeps once the cord settles.
 */

const W = 96; // stage width (px)
const AX = W / 2; // anchor x
const MAX_PULL = 140; // how far past rest the cord can stretch
const THRESHOLD = 44; // stretched distance that switches (≈ 55px of real pointer travel)
const FLICK_SPEED = 450; // px/s downward on release that also switches
const FLICK_MIN = 18; // …as long as it was pulled at least this far

type V = { x: number; y: number };

/** Where the pointer wants the knob to be, with rubber-banding near the end of travel. */
function pointerTarget(s: { pointer: V; grabOffset: number; rest: number }, rect: DOMRect) {
  const pull = s.pointer.y - rect.top - s.grabOffset - s.rest;
  const band = pull > 0 ? MAX_PULL * (1 - Math.exp(-pull / MAX_PULL)) : pull * 0.3;
  return {
    tx: AX + Math.max(-40, Math.min(40, (s.pointer.x - rect.left - AX) * 0.5)),
    ty: s.rest + band,
    raw: pull,
  };
}

export default function PullCord() {
  const theme = useTheme();
  const stageRef = useRef<HTMLDivElement>(null);
  const cordRef = useRef<SVGPathElement>(null);
  const coreRef = useRef<SVGPathElement>(null);
  const knobRef = useRef<SVGGElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const releaseRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const [hint, setHint] = useState(() => {
    try {
      return localStorage.getItem('cord-pulled') !== 'yes';
    } catch {
      return true;
    }
  });

  // Mutable physics state lives in a ref so React never re-renders per frame.
  const sim = useRef({
    rest: 118,
    pos: { x: AX, y: -80 } as V, // starts above the viewport and drops in
    vel: { x: 0, y: 0 } as V,
    dragging: false,
    pointer: { x: AX, y: 0 } as V,
    pointerVel: 0, // px/s, positive = downward
    lastMoveAt: 0,
    grabOffset: 0,
    armed: false,
    raf: 0,
    last: 0,
    downAt: 0,
    downPos: { x: 0, y: 0 } as V,
    moved: 0,
    auto: 0, // timestamp until which an automated (keyboard/tap) pull holds the knob down
    wake: () => {},
  });

  useEffect(() => {
    const s = sim.current;
    const reduced = prefersReducedMotion();
    // Full length in the hero; retracts into the header band once you scroll so it never covers content.
    const setRest = () => {
      const scrolled = window.scrollY > window.innerHeight * 0.5;
      const mobile = window.innerWidth < 768;
      s.rest = scrolled ? (mobile ? 40 : 46) : mobile ? 66 : 118;
      if (hintRef.current) hintRef.current.style.opacity = scrolled ? '0' : '1';
    };
    setRest();
    if (reduced) s.pos = { x: AX, y: s.rest };

    const render = () => {
      const { x, y } = s.pos;
      const dx = x - AX;
      // Control point lags behind horizontal velocity → the chain whips a little.
      const cx = AX + dx * 0.5 - s.vel.x * 0.035;
      const d = `M ${AX} 0 Q ${cx} ${y * 0.5} ${x} ${y}`;
      cordRef.current?.setAttribute('d', d);
      coreRef.current?.setAttribute('d', d);
      const stretch = Math.max(0, y - s.rest) / MAX_PULL;
      cordRef.current?.setAttribute('stroke-dasharray', `0 ${(6.4 + stretch * 2.6).toFixed(2)}`);
      const angle = (-Math.atan2(dx, Math.max(1, y)) * 180) / Math.PI;
      const scale = s.dragging ? 1.1 : 1;
      knobRef.current?.setAttribute('transform', `translate(${x} ${y}) rotate(${angle.toFixed(2)}) scale(${scale})`);
      // generous hit area around the handle
      if (btnRef.current) btnRef.current.style.transform = `translate(${x - 36}px, ${y - 14}px)`;
      // the chain itself is grabbable too
      if (stripRef.current) stripRef.current.style.height = `${Math.max(0, y - 6)}px`;
      const prog = Math.min(1, Math.max(0, (y - s.rest) / THRESHOLD));
      if (glowRef.current) {
        glowRef.current.setAttribute('cx', String(x));
        glowRef.current.setAttribute('cy', String(y + 24));
        glowRef.current.setAttribute('r', String(14 + prog * 12));
        glowRef.current.style.opacity = String(prog >= 1 ? 1 : prog * 0.35);
      }
      if (releaseRef.current) {
        releaseRef.current.style.transform = `translate(${x - 18}px, ${y + 52}px)`;
        releaseRef.current.style.opacity = s.dragging && prog >= 1 ? '1' : '0';
      }
      if (hintRef.current) hintRef.current.style.transform = `translate(0, ${y - s.rest}px)`;
    };

    const step = (now: number) => {
      const dt = Math.min(0.032, (now - (s.last || now)) / 1000) || 0.016;
      s.last = now;
      const rect = stageRef.current?.getBoundingClientRect();

      if (s.dragging && rect) {
        // Track the pointer closely so the handle feels attached to your hand.
        const { tx, ty } = pointerTarget(s, rect);
        const nx = s.pos.x + (tx - s.pos.x) * 0.55;
        const ny = s.pos.y + (ty - s.pos.y) * 0.8;
        s.vel = { x: (nx - s.pos.x) / dt, y: (ny - s.pos.y) / dt };
        s.pos = { x: nx, y: ny };
        const armed = ty - s.rest > THRESHOLD;
        if (armed !== s.armed) {
          s.armed = armed;
          if (armed) navigator.vibrate?.(8);
        }
      } else if (s.auto > now) {
        // Automated pull: ease the knob down past the threshold.
        const ty = s.rest + THRESHOLD + 26;
        s.pos.y += (ty - s.pos.y) * 0.35;
        s.vel = { x: 0, y: 0 };
      } else {
        // Damped springs back to rest: stiff and bouncy vertically, loose pendulum horizontally.
        const ay = -230 * (s.pos.y - s.rest) - 12 * s.vel.y + (s.pos.y < s.rest - 20 ? 900 : 0);
        const ax = -70 * (s.pos.x - AX) - 4.2 * s.vel.x;
        s.vel.y += ay * dt;
        s.vel.x += ax * dt;
        s.pos.y += s.vel.y * dt;
        s.pos.x += s.vel.x * dt;
      }

      render();

      const settled =
        !s.dragging &&
        s.auto <= now &&
        Math.abs(s.pos.y - s.rest) < 0.05 &&
        Math.abs(s.pos.x - AX) < 0.05 &&
        Math.abs(s.vel.x) < 0.5 &&
        Math.abs(s.vel.y) < 0.5;
      if (settled) {
        s.pos = { x: AX, y: s.rest };
        render();
        s.raf = 0;
        s.last = 0;
        return;
      }
      s.raf = requestAnimationFrame(step);
    };

    const wake = () => {
      if (!s.raf) s.raf = requestAnimationFrame(step);
    };
    s.wake = wake;

    render();
    // Drop the cord in after the loader lifts.
    const dropTimer = window.setTimeout(wake, reduced ? 0 : 1900);

    // Occasional idle nudge so the cord feels alive.
    const nudge = window.setInterval(() => {
      if (reduced || s.dragging || document.hidden) return;
      s.vel.x += (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 14);
      wake();
    }, 7000);

    // Scrolling gives the cord a little sway.
    let lastY = window.scrollY;
    const onScroll = () => {
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      const prevRest = s.rest;
      setRest();
      if (prevRest !== s.rest) wake();
      if (reduced || s.dragging) return;
      s.vel.x += Math.max(-40, Math.min(40, dy * 0.6));
      wake();
    };
    const onResize = () => {
      setRest();
      wake();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      window.clearTimeout(dropTimer);
      window.clearInterval(nudge);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const wake = () => sim.current.wake();

  const fire = () => {
    const s = sim.current;
    const rect = stageRef.current?.getBoundingClientRect();
    const origin = rect ? { x: rect.left + s.pos.x, y: rect.top + s.pos.y + 20 } : undefined;
    navigator.vibrate?.(14);
    toggleTheme(origin);
    if (hint) {
      setHint(false);
      try {
        localStorage.setItem('cord-pulled', 'yes');
      } catch {
        /* ignore */
      }
    }
  };

  /** Keyboard / tap: perform the whole pull automatically. */
  const autoPull = () => {
    const s = sim.current;
    if (s.auto > performance.now()) return;
    s.auto = performance.now() + 200;
    wake();
    window.setTimeout(() => {
      fire();
      s.vel.y = -280;
      wake();
    }, 180);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const s = sim.current;
    const rect = stageRef.current!.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    s.dragging = true;
    s.armed = false;
    s.pointer = { x: e.clientX, y: e.clientY };
    s.pointerVel = 0;
    s.lastMoveAt = performance.now();
    // Grabbing the chain above the handle still pulls from the handle.
    s.grabOffset = Math.min(e.clientY - rect.top - s.pos.y, 40);
    s.downAt = performance.now();
    s.downPos = { x: e.clientX, y: e.clientY };
    s.moved = 0;
    document.documentElement.dataset.cordDragging = 'true';
    wake();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const s = sim.current;
    if (!s.dragging) return;
    const now = performance.now();
    const dtm = Math.max(8, now - s.lastMoveAt) / 1000;
    s.pointerVel = s.pointerVel * 0.4 + ((e.clientY - s.pointer.y) / dtm) * 0.6;
    s.lastMoveAt = now;
    s.pointer = { x: e.clientX, y: e.clientY };
    s.moved = Math.max(s.moved, Math.hypot(e.clientX - s.downPos.x, e.clientY - s.downPos.y));
  };

  const release = (e: React.PointerEvent<HTMLElement>) => {
    const s = sim.current;
    if (!s.dragging) return;
    s.dragging = false;
    delete document.documentElement.dataset.cordDragging;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    s.pointer = { x: e.clientX, y: e.clientY };
    const quickTap = s.moved < 6 && performance.now() - s.downAt < 400;
    // Judge the pull by where the pointer actually went (not the rendered knob), so fast
    // pulls on slow devices still count; a quick downward flick counts too.
    const rect = stageRef.current?.getBoundingClientRect();
    const { ty, raw } = rect ? pointerTarget(s, rect) : { ty: s.pos.y, raw: 0 };
    const recentMove = performance.now() - s.lastMoveAt < 120;
    const flick = recentMove && s.pointerVel > FLICK_SPEED && raw > FLICK_MIN;
    if (quickTap) {
      autoPull();
    } else if (ty - s.rest > THRESHOLD || flick) {
      s.pos.y = Math.max(s.pos.y, ty);
      fire();
    }
    s.armed = false;
    wake();
  };

  const onClick = (e: React.MouseEvent) => {
    // Pointer interactions are handled above; this only fires for keyboard activation (detail === 0).
    if (e.detail === 0) autoPull();
  };

  const next = theme === 'dark' ? 'light' : 'dark';
  const grab = {
    onPointerDown,
    onPointerMove,
    onPointerUp: release,
    onPointerCancel: release,
    onLostPointerCapture: release,
  };

  return (
    <div ref={stageRef} className="pointer-events-none fixed top-0 right-2 z-[70] h-[420px] md:right-8" style={{ width: W }}>
      <svg className="absolute inset-0 overflow-visible" width={W} height={420} aria-hidden="true">
        <defs>
          <linearGradient id="knob-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--knob-b)" />
            <stop offset="0.35" stopColor="var(--knob-a)" />
            <stop offset="0.7" stopColor="var(--knob-b)" />
            <stop offset="1" stopColor="var(--knob-b)" />
          </linearGradient>
          <radialGradient id="knob-shine" cx="0.35" cy="0.3" r="0.6">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="knob-glow">
            <stop offset="0" stopColor="var(--fg)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--fg)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* ceiling mount */}
        <rect x={AX - 14} y={-6} width={28} height={10} rx={3} fill="var(--surface-2)" stroke="var(--line)" />
        {/* "ready to switch" glow behind the handle */}
        <circle ref={glowRef} cx={AX} cy={140} r={14} fill="url(#knob-glow)" style={{ opacity: 0, transition: 'opacity .15s' }} />
        {/* thin link under the beads keeps the chain reading as continuous */}
        <path ref={coreRef} fill="none" stroke="var(--cord-shade)" strokeWidth={0.9} />
        <path ref={cordRef} fill="none" stroke="var(--cord)" strokeWidth={3.6} strokeLinecap="round" strokeDasharray="0 6.4" />
        <g ref={knobRef} style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,.35))' }}>
          <circle cx={0} cy={2} r={2.6} fill="none" stroke="var(--cord)" strokeWidth={1.4} />
          <path d="M -3 5 L 3 5 L 4.5 11 C 9 14 10 20 10 27 C 10 36 6 41 0 41 C -6 41 -10 36 -10 27 C -10 20 -9 14 -4.5 11 Z" fill="url(#knob-grad)" />
          <path d="M -3 5 L 3 5 L 4.5 11 C 9 14 10 20 10 27 C 10 36 6 41 0 41 C -6 41 -10 36 -10 27 C -10 20 -9 14 -4.5 11 Z" fill="url(#knob-shine)" />
          <ellipse cx={0} cy={40} rx={6} ry={1.4} fill="var(--knob-b)" opacity={0.6} />
        </g>
      </svg>

      {/* the chain is grabbable along its whole length */}
      <div
        ref={stripRef}
        aria-hidden="true"
        data-cursor="pull"
        {...grab}
        className="pointer-events-auto absolute top-0 cursor-grab"
        style={{ left: AX - 14, width: 28, touchAction: 'none' }}
      />

      <button
        ref={btnRef}
        type="button"
        role="switch"
        aria-checked={theme === 'light'}
        aria-label={`Light switch. Pull the cord to switch to ${next} mode.`}
        title={`Pull for ${next} mode`}
        data-cursor="pull"
        {...grab}
        onClick={onClick}
        className="pointer-events-auto absolute top-0 left-0 h-[84px] w-[72px] cursor-grab rounded-full bg-transparent active:cursor-grabbing"
        style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
      />

      <span
        ref={releaseRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 rounded-full bg-fg px-2 py-0.5 font-mono text-[9px] tracking-[0.18em] text-bg uppercase transition-opacity duration-150"
        style={{ opacity: 0 }}
      >
        Release
      </span>

      {hint && (
        <div ref={hintRef} className="absolute top-[150px] right-[64px] hidden transition-opacity duration-500 select-none md:block" aria-hidden="true">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] whitespace-nowrap text-muted uppercase opacity-0 [animation:hint-in_.8s_2.6s_forwards]">
            <span>Pull for {next}</span>
            <svg width="34" height="16" viewBox="0 0 34 16" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M1 12 C 10 14, 22 12, 31 3" />
              <path d="M26 3 L 31 3 L 30 8" />
            </svg>
          </div>
        </div>
      )}
      <style>{`@keyframes hint-in{to{opacity:1}}`}</style>
    </div>
  );
}
