import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/theme';

/**
 * Interactive dot grid behind the hero. Dots near the cursor swell, brighten and
 * get pushed away like iron filings; a slow wave keeps it breathing. Colour follows the theme.
 */
export default function DotField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const reduced = prefersReducedMotion();
    const GAP = 30;
    let w = 0,
      h = 0,
      dpr = 1,
      raf = 0,
      visible = true;
    const mouse = { x: -9999, y: -9999, active: false };
    let color = '255,255,255';

    const readColor = () => {
      const fg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim();
      const m = fg.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
      color = m ? `${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)}` : '255,255,255';
    };

    const resize = () => {
      const r = canvas.parentElement!.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const R = 170;
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const d = Math.hypot(dx, dy);
          const f = mouse.active ? Math.max(0, 1 - d / R) : 0;
          const wave = reduced ? 0 : (Math.sin(x * 0.012 + t * 0.0012) + Math.cos(y * 0.015 + t * 0.001)) * 0.5;
          const push = f * f * 16;
          const px = x + (d ? (dx / d) * push : 0);
          const py = y + (d ? (dy / d) * push : 0) + wave * 1.5;
          const a = 0.07 + f * 0.55 + (wave + 1) * 0.02;
          const size = 0.9 + f * 2.2;
          ctx.fillStyle = `rgba(${color},${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (t: number) => {
      draw(t);
      raf = visible && !reduced ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!raf && !reduced) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = mouse.y > -50 && mouse.y < h + 50;
      if (reduced) draw(0);
    };
    const onLeave = () => (mouse.active = false);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);
    const mo = new MutationObserver(() => {
      readColor();
      draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    readColor();
    resize();
    start();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-20 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]"
    />
  );
}
