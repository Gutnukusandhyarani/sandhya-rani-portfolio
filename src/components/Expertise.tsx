import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { skillCategories, projectsUsing } from '../data/portfolio';
import SectionLabel from './ui/SectionLabel';
import Reveal from './ui/Reveal';
import Magnetic from './ui/Magnetic';
import SkillConstellation from './SkillConstellation';

const EASE = [0.16, 1, 0.3, 1] as const;

function SkillChip({ name, i }: { name: string; i: number }) {
  const reduce = useReducedMotion();
  const used = projectsUsing(name);
  return (
    <motion.li initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.55, delay: i * 0.04, ease: EASE }} className="list-none">
      <motion.div animate={reduce ? undefined : { y: [0, -4, 0] }} transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}>
        <Magnetic strength={0.35}>
          <div className="group relative rounded-full border border-line bg-bg px-4 py-2.5 text-[clamp(.95rem,1.4vw,1.15rem)] tracking-[-0.02em] transition-colors duration-300 hover:border-fg hover:bg-fg hover:text-bg">
            {name}
            {used.length > 0 && <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 w-max max-w-[220px] -translate-x-1/2 translate-y-1 rounded-md border border-line bg-surface px-3 py-2 font-mono text-[10px] leading-relaxed tracking-[0.06em] text-muted opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">Used in {used.join(', ')}</span>}
          </div>
        </Magnetic>
      </motion.div>
    </motion.li>
  );
}

export default function Expertise() {
  const [active, setActive] = useState(skillCategories[0].id);
  const cat = skillCategories.find((c) => c.id === active)!;
  return (
    <section id="expertise" className="relative px-4 py-28 md:px-8 md:py-44" aria-labelledby="expertise-title">
      <div className="mb-16 grid gap-8 md:mb-24 md:grid-cols-12">
        <div className="md:col-span-4"><SectionLabel index="02">Expertise</SectionLabel></div>
        <div className="md:col-span-7 md:col-start-6">
          <h2 id="expertise-title" className="text-[clamp(2rem,4vw,3.6rem)] leading-[0.98] font-medium tracking-[-0.045em]">Security is a workflow, <span className="font-serif font-normal italic">not a single tool.</span></h2>
          <Reveal delay={0.2}><p className="mt-6 max-w-[48ch] text-muted">A practical mix of endpoint monitoring, detection logic, scripting and application-security fundamentals. Hover a skill to see where it is used in these projects.</p></Reveal>
        </div>
      </div>
      <Reveal className="mb-20 md:mb-28"><SkillConstellation /></Reveal>
      <div className="grid gap-12 md:grid-cols-12 md:gap-6">
        <div role="tablist" aria-label="Skill categories" aria-orientation="vertical" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:col-span-5 md:mx-0 md:block md:overflow-visible md:px-0 md:pb-0">
          {skillCategories.map((c) => {
            const on = c.id === active;
            return <button key={c.id} role="tab" id={`tab-${c.id}`} aria-selected={on} aria-controls="skills-panel" onMouseEnter={() => setActive(c.id)} onFocus={() => setActive(c.id)} onClick={() => setActive(c.id)} className={`group relative flex shrink-0 items-baseline gap-4 rounded-full border px-4 py-2 text-left transition-colors duration-500 md:w-full md:rounded-none md:border-0 md:border-t md:px-0 md:py-6 ${on ? 'border-fg md:border-line' : 'border-line'}`}>
              <span className={`hidden font-mono text-xs transition-colors md:inline ${on ? 'text-fg' : 'text-faint'}`}>{c.index}</span>
              <span className={`text-[15px] whitespace-nowrap transition-all duration-500 md:text-[clamp(1.5rem,2.6vw,2.4rem)] md:tracking-[-0.04em] ${on ? 'text-fg md:translate-x-3' : 'text-muted group-hover:text-fg'}`}>{on ? <span className="md:font-serif md:italic">{c.title}</span> : c.title}</span>
              {on && <motion.span layoutId="skill-bar" className="absolute top-[-1px] left-0 hidden h-px w-full bg-fg md:block" transition={{ duration: 0.6, ease: EASE }} />}
            </button>;
          })}
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <div className="md:sticky md:top-32">
            <div id="skills-panel" role="tabpanel" aria-labelledby={`tab-${cat.id}`} className="relative min-h-[340px] rounded-[2px] border border-line p-6 md:p-10">
              <span aria-hidden="true" className="text-outline pointer-events-none absolute -top-6 right-4 font-serif text-[9rem] leading-none italic select-none md:text-[12rem]">{cat.index}</span>
              <AnimatePresence mode="wait"><motion.div key={cat.id} className="relative">
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="max-w-[36ch] text-muted">{cat.blurb}</motion.p>
                <ul className="mt-10 flex flex-wrap gap-3">{cat.skills.map((s, i) => <SkillChip key={s} name={s} i={i} />)}</ul>
              </motion.div></AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
