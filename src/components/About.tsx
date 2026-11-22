import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { stats } from '../data/portfolio';
import { gsap, ScrollTrigger } from '../lib/scroll';
import SectionLabel from './ui/SectionLabel';
import Reveal from './ui/Reveal';

const STATEMENT = 'I build practical defensive security tools that turn raw endpoint telemetry into structured events, testable detections and investigation workflows. My focus is on making security logic understandable, repeatable and easier to validate.';

function ScrubStatement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce || !ref.current) return;
    const words = ref.current.querySelectorAll('[data-w]');
    const ctx = gsap.context(() => {
      gsap.fromTo(words, { opacity: 0.16 }, { opacity: 1, stagger: 0.055, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    });
    return () => ctx.revert();
  }, [reduce]);
  return <p ref={ref} className="text-[clamp(1.9rem,4.6vw,4.4rem)] leading-[1.06] font-medium tracking-[-0.045em]" aria-label={STATEMENT}>{STATEMENT.split(' ').map((w, i) => <span key={i} data-w aria-hidden="true" className={/telemetry|detections|investigation/.test(w.toLowerCase()) ? 'font-serif font-normal tracking-[-0.02em] italic' : ''}>{w}{' '}</span>)}</p>;
}

function Counter({ value, decimals, suffix }: { value: number; decimals: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const o = { v: 0 };
    const tw = gsap.to(o, { v: value, duration: 1.6, ease: 'power3.out', onUpdate: () => setN(o.v) });
    return () => {
  tw.kill();
};
  }, [inView, value, reduce]);
  return <span ref={ref} className="tabular-nums">{n.toFixed(decimals)}{suffix}</span>;
}

export default function About() {
  useEffect(() => { ScrollTrigger.refresh(); }, []);
  return (
    <section id="about" className="relative px-4 py-24 md:px-8 md:py-32" aria-labelledby="about-title">
      <div className="mb-14 flex items-end justify-between gap-6 md:mb-20"><SectionLabel index="01">About</SectionLabel><h2 id="about-title" className="sr-only">About me</h2></div>
      <div className="grid gap-16 md:grid-cols-12"><div className="md:col-span-11"><ScrubStatement /></div></div>
      <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-[2px] border border-line bg-line md:mt-24 md:grid-cols-4">
        {stats.map((s, i) => <Reveal key={s.label} delay={i * 0.08} className="bg-bg p-5 md:p-8"><div className="text-[clamp(2rem,4.5vw,4.1rem)] leading-none font-medium tracking-[-0.05em]"><Counter {...s} /></div><div className="mt-4 text-sm text-muted">{s.label}</div></Reveal>)}
      </div>
      <p className="mt-4 font-mono text-[9px] tracking-[0.12em] text-faint uppercase">Project-level automated checks and local integration fixtures; not production SOC metrics.</p>
    </section>
  );
}
