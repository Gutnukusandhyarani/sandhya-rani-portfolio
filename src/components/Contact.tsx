import { useEffect, useRef, useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import { ArrowUp, ArrowUpRight, Check, Copy, Download, Github, Linkedin, Mail } from 'lucide-react';
import { profile } from '../data/portfolio';
import { scrollToId } from '../lib/scroll';
import SectionLabel from './ui/SectionLabel';
import SplitText from './ui/SplitText';
import Magnetic from './ui/Magnetic';
import Reveal from './ui/Reveal';

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <button type="button" onClick={async () => {
      try { await navigator.clipboard.writeText(profile.email); setCopied(true); timer.current = window.setTimeout(() => setCopied(false), 1800); }
      catch { window.location.href = `mailto:${profile.email}`; }
    }} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-fg hover:text-fg" aria-live="polite">
      {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied to clipboard' : 'Copy email'}
    </button>
  );
}

function BackToTop() {
  const { scrollYProgress } = useScroll();
  return <Magnetic strength={0.5}><button type="button" onClick={() => scrollToId('home')} aria-label="Back to top" className="group relative grid h-16 w-16 place-items-center rounded-full border border-line transition-colors hover:bg-fg hover:text-bg">
    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64" aria-hidden="true"><motion.circle cx="32" cy="32" r="31" fill="none" stroke="currentColor" strokeWidth="1" style={{ pathLength: scrollYProgress }}/></svg>
    <ArrowUp size={18} className="transition-transform duration-500 group-hover:-translate-y-1"/>
  </button></Magnetic>;
}

const links = [
  { label: 'GitHub', href: profile.links.github, icon: Github, note: 'Source code' },
  { label: 'LinkedIn', href: profile.links.linkedin, icon: Linkedin, note: 'Connect' },
  { label: 'Email', href: `mailto:${profile.email}`, icon: Mail, note: 'Write to me' },
];

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden px-4 pt-24 md:px-8 md:pt-32" aria-labelledby="contact-title">
      <SectionLabel index="05">Contact</SectionLabel>
      <h2 id="contact-title" className="mt-8 text-[clamp(2.6rem,6.4vw,6.8rem)] leading-[0.9] font-medium tracking-[-0.055em] md:mt-10">
        <SplitText text="Let's talk" className="block" />
        <SplitText text="security & systems." delay={0.15} className="block font-serif font-normal tracking-[-0.035em] italic" />
      </h2>
      <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-7">
          <Reveal>
            <p className="max-w-[40ch] text-muted">Open to cybersecurity roles, project collaboration and thoughtful conversations about defensive engineering.</p>
            <Magnetic strength={0.15} className="mt-6 max-w-full">
              <a href={`mailto:${profile.email}`} className="group relative inline-block max-w-full text-[clamp(1.35rem,2.8vw,2.5rem)] font-medium tracking-[-0.035em] break-all">{profile.email}<span className="absolute -bottom-1 left-0 h-[2px] w-full origin-right scale-x-0 bg-fg transition-transform duration-700 group-hover:origin-left group-hover:scale-x-100"/></a>
            </Magnetic>
            <div className="mt-6 flex flex-wrap items-center gap-3"><CopyEmail/><Magnetic><a href={`mailto:${profile.email}?subject=${encodeURIComponent("Let's connect about cybersecurity")}`} className="group inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2 text-sm font-medium text-bg">Start a conversation <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/></a></Magnetic></div>
          </Reveal>
        </div>
        <ul className="md:col-span-4 md:col-start-9">
          {links.map((link, i) => <Reveal as="li" key={link.label} delay={i * 0.06}><a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noreferrer' : undefined} className="group flex items-center justify-between gap-4 border-t border-line py-3.5 transition-colors last:border-b">
            <span className="flex items-center gap-4"><link.icon size={17} strokeWidth={1.5} className="text-muted transition-colors group-hover:text-fg"/><span className="text-lg tracking-[-0.02em] transition-transform duration-500 group-hover:translate-x-1.5">{link.label}</span></span>
            <span className="flex items-center gap-3 font-mono text-[11px] text-muted">{link.note}<ArrowUpRight size={14} className="transition-transform duration-500 group-hover:rotate-45"/></span>
          </a></Reveal>)}
          {profile.resume && <Reveal as="li" delay={0.2}><a href={profile.resume} download className="group flex items-center justify-between gap-4 border-t border-line py-3.5 transition-colors last:border-b">
            <span className="flex items-center gap-4"><Download size={17} strokeWidth={1.5} className="text-muted transition-colors group-hover:text-fg"/><span className="text-lg tracking-[-0.02em] transition-transform duration-500 group-hover:translate-x-1.5">Résumé</span></span>
            <span className="flex items-center gap-3 font-mono text-[11px] text-muted">PDF<ArrowUpRight size={14}/></span>
          </a></Reveal>}
        </ul>
      </div>
      <footer className="mt-20 border-t border-line md:mt-28">
        <div className="flex flex-col-reverse gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-sm text-muted"><p>© {new Date().getFullYear()} {profile.name}. Designed &amp; built as a security portfolio.</p><p className="font-mono text-[11px] tracking-[0.12em] text-faint uppercase">React · TypeScript · Framer Motion · GSAP · Lenis</p></div>
          <div className="flex items-center gap-5"><span className="hidden font-mono text-[11px] tracking-[0.2em] text-muted uppercase sm:block">Back to top</span><BackToTop/></div>
        </div>
      </footer>
    </section>
  );
}
