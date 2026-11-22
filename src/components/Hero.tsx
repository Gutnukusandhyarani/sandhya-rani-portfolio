import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Github, Linkedin } from 'lucide-react';
import { profile } from '../data/portfolio';
import { scrollToId } from '../lib/scroll';
import Magnetic from './ui/Magnetic';
import RotatingBadge from './fx/RotatingBadge';
import DotField from './fx/DotField';
import SecurityVisual from './SecurityVisual';

const EASE = [0.16, 1, 0.3, 1] as const;

function RotatingRole({ start }: { start: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!start) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % profile.roles.length), 2600);
    return () => window.clearInterval(id);
  }, [start]);
  return (
    <span className="relative inline-flex h-[1.3em] overflow-hidden align-bottom" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={profile.roles[i]} className="inline-block whitespace-nowrap" initial={{ y: '100%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} exit={{ y: '-100%', opacity: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          {profile.roles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function LocalTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: profile.timezone });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time} IST</span>;
}

export default function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -65]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 18 });
  const py = useSpring(my, { stiffness: 60, damping: 18 });
  const visualX = useTransform(px, (v) => v * -0.65);
  const visualY = useTransform(py, (v) => v * -0.65);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse') return;
    mx.set((e.clientX / window.innerWidth - 0.5) * 16);
    my.set((e.clientY / window.innerHeight - 0.5) * 10);
  };
  const show = ready ? 'show' : 'hidden';
  const fadeIn = (delay: number) => ({
    initial: 'hidden' as const,
    animate: show,
    variants: { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 1, delay, ease: EASE } } },
  });
  const name = profile.name.toUpperCase();

  return (
    <section id="home" ref={ref} onPointerMove={onMove} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden px-4 pt-24 md:min-h-[900px] md:px-8 md:pt-28" aria-label="Introduction">
      <div aria-hidden="true" className="pointer-events-none absolute -top-[20vh] right-[-10vw] -z-10 h-[140vh] w-[80vw] opacity-90" style={{ background: 'radial-gradient(50% 50% at 70% 30%, var(--glow), transparent 70%)' }} />
      <DotField />
      <div className="relative flex flex-1 flex-col justify-center pb-12 md:pb-20">
        <motion.div style={{ y: textY, opacity: fade }} className="relative z-20">
          <motion.div {...fadeIn(0.05)} className="inline-flex w-fit items-center gap-3 rounded-full border border-line bg-bg/70 px-4 py-1.5 text-[12px] text-muted backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-fg">{profile.availability}</span>
            <span className="hidden h-3 w-px bg-line sm:block" />
            <span className="hidden sm:inline">{profile.location}</span>
          </motion.div>
          <motion.p {...fadeIn(0.15)} className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-serif text-[clamp(1.9rem,3.4vw,3.2rem)] leading-none italic">Hello, I'm</span>
            <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase"><span className="text-faint">— </span><span className="text-fg"><RotatingRole start={ready} /></span></span>
          </motion.p>
        </motion.div>

        <motion.h1
          style={{ y: textY }}
          className="relative z-0 -mx-1 mt-4 text-[clamp(3.25rem,13.2vw,13.5rem)] leading-[0.82] font-semibold tracking-[-0.075em] break-words md:max-w-[92%]"
          aria-label={`Hello, I'm ${profile.name}`}
        >
          {name.split('').map((c, i) => (
            <span key={`${c}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span className="inline-block" style={{ color: `color-mix(in oklab, var(--fg) ${Math.round(100 - (i / Math.max(1, name.length - 1)) * 48)}%, var(--name-fade))` }} initial={{ y: '105%', rotate: 5 }} animate={ready ? { y: '0%', rotate: 0 } : {}} transition={{ duration: 1.1, delay: 0.2 + i * 0.035, ease: EASE }}>{c === ' ' ? '\u00a0' : c}</motion.span>
            </span>
          ))}
        </motion.h1>

        <div className="mt-10 grid items-end gap-10 md:mt-14 md:grid-cols-12 md:gap-6">
          <motion.div style={{ y: textY, opacity: fade }} className="relative z-20 md:col-span-5 lg:col-span-4">
            <motion.p {...fadeIn(0.55)} className="max-w-[38ch] text-[clamp(1.05rem,1.5vw,1.35rem)] leading-[1.4] tracking-[-0.015em] text-muted">
              I build practical <span className="text-fg">defensive security tools</span> — from endpoint telemetry and alert workflows to testable detections and SIEM query generation.
            </motion.p>
            <motion.div {...fadeIn(0.75)} className="mt-7 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToId('projects'); }} className="group inline-flex items-center gap-3 rounded-full bg-fg px-6 py-3.5 text-sm font-medium text-bg">
                  Explore projects <ArrowDownRight size={16} className="transition-transform duration-500 group-hover:rotate-[-45deg]" />
                </a>
              </Magnetic>
              <Magnetic>
                <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToId('contact'); }} className="group inline-flex items-center gap-3 rounded-full border border-line bg-bg/70 px-6 py-3.5 text-sm font-medium backdrop-blur-sm transition-colors hover:border-fg">
                  Get in touch <ArrowUpRight size={15} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Magnetic>
              {profile.resume && <Magnetic>
                <a href={profile.resume} download className="group inline-flex items-center gap-3 rounded-full border border-line px-6 py-3.5 text-sm font-medium text-muted transition-colors hover:border-fg hover:text-fg">
                  Download résumé <ArrowUpRight size={15} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Magnetic>}
            </motion.div>
            <motion.div {...fadeIn(0.95)} className="mt-8 flex items-center gap-5 text-muted">
              <a className="inline-flex items-center gap-2 text-xs transition-colors hover:text-fg" href={profile.links.github} target="_blank" rel="noreferrer"><Github size={14}/> GitHub</a>
              <a className="inline-flex items-center gap-2 text-xs transition-colors hover:text-fg" href={profile.links.linkedin} target="_blank" rel="noreferrer"><Linkedin size={14}/> LinkedIn</a>
            </motion.div>
          </motion.div>

          <motion.div style={{ x: visualX, y: visualY }} className="relative md:col-span-7 md:col-start-6 lg:col-span-7 lg:col-start-6">
            <SecurityVisual />
            <div className="absolute -bottom-7 left-4 z-20 hidden md:block"><RotatingBadge ready={ready} /></div>
          </motion.div>
        </div>
      </div>

      <motion.div {...fadeIn(1.15)} className="relative z-20 flex items-center justify-between border-t border-line py-5 font-mono text-[9px] tracking-[0.16em] text-faint uppercase md:text-[10px]">
        <span>Collect · Detect · Validate · Investigate</span>
        <span className="hidden sm:inline">Local time <LocalTime /></span>
        <button type="button" onClick={() => scrollToId('about')} className="group inline-flex items-center gap-2 text-muted transition-colors hover:text-fg">Scroll to explore <span className="inline-block transition-transform group-hover:translate-y-1">↓</span></button>
      </motion.div>
    </section>
  );
}
