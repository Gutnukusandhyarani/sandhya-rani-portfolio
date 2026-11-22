import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { ArrowDownRight, CheckCircle2, GitBranch, RadioTower, ShieldCheck, TestTube2 } from 'lucide-react';
import { workflow, focusAreas, projects } from '../data/portfolio';
import SectionLabel from './ui/SectionLabel';
import SplitText from './ui/SplitText';
import Reveal from './ui/Reveal';

const icons = [RadioTower, GitBranch, ShieldCheck, TestTube2];

export default function Experience() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <section id="experience" className="relative px-4 py-24 md:px-8 md:py-32" aria-labelledby="experience-title">
      <div className="mb-12 md:mb-16">
        <SectionLabel index="04">Workflow</SectionLabel>
        <h2 id="experience-title" className="mt-6 text-[clamp(2rem,4vw,3.6rem)] leading-[0.98] font-medium tracking-[-0.045em]">
          <SplitText text="From signal" className="block" />
          <SplitText text="to investigation." delay={0.12} className="block font-serif font-normal tracking-[-0.03em] italic" />
        </h2>
      </div>

      <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <h3 className="mb-6 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">End-to-end security workflow</h3>
          <ol className="relative">
            <span aria-hidden="true" className="absolute top-1 bottom-1 left-[5px] w-px bg-line" />
            <motion.span aria-hidden="true" style={{ scaleY: reduce ? 1 : scaleY }} className="absolute top-1 bottom-1 left-[5px] w-px origin-top bg-fg" />
            {workflow.map((step, i) => {
              const Icon = icons[i] ?? CheckCircle2;
              return (
                <Reveal as="li" key={step.index} delay={i * 0.06} className={`relative pl-8 ${i > 0 ? 'mt-10' : ''}`}>
                  <span aria-hidden="true" className="absolute top-1.5 left-0 grid h-[12px] w-[12px] place-items-center rounded-full border border-fg bg-bg" />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                    <h4 className="flex items-center gap-3 text-[clamp(1.2rem,1.7vw,1.5rem)] leading-tight font-medium tracking-[-0.03em]"><Icon size={17} strokeWidth={1.5} className="text-muted"/>{step.title}</h4>
                    <span className="font-mono text-[11px] tracking-[0.08em] text-muted">{step.index}</span>
                  </div>
                  <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-muted">{step.detail}</p>
                  <p className="mt-3 font-mono text-[9px] tracking-[0.16em] text-faint uppercase">{step.tool}</p>
                </Reveal>
              );
            })}
          </ol>
        </div>

        <div className="lg:col-span-5">
          <h3 className="mb-6 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Current focus areas</h3>
          <ul className="border-t border-line">
            {focusAreas.map((area, i) => (
              <Reveal as="li" key={area.title} delay={i * 0.05} y={14}>
                <div className="border-b border-line py-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium tracking-[-0.02em]">{area.title}</span>
                    <span className="font-mono text-[9px] tracking-[0.16em] text-faint">0{i + 1}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{area.detail}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.2} className="mt-8 rounded-[3px] border border-line bg-surface/40 p-5 md:p-6">
            <span className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">Connected projects</span>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-line bg-bg"><RadioTower size={17}/></span>
              <div><p className="font-medium">{projects[1].title}</p><p className="text-xs text-muted">Authors and exports detections</p></div>
            </div>
            <div className="ml-5 h-8 border-l border-dashed border-line" />
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-line bg-bg"><ShieldCheck size={17}/></span>
              <div><p className="font-medium">{projects[0].title}</p><p className="text-xs text-muted">Imports rules and generates reviewable alerts</p></div>
            </div>
            <a href="#projects" className="mt-6 inline-flex items-center gap-2 border-b border-fg pb-1 text-sm">Explore both projects <ArrowDownRight size={14}/></a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
