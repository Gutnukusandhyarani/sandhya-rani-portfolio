import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ExternalLink, Github, Lock, Terminal, X } from 'lucide-react';
import { projects, type Project } from '../data/portfolio';
import { lockScroll } from '../lib/scroll';
import SectionLabel from './ui/SectionLabel';
import SplitText from './ui/SplitText';
import Reveal from './ui/Reveal';

const EASE = [0.16, 1, 0.3, 1] as const;

function ProjectCard({ p, i, onOpen }: { p: Project; i: number; onOpen: () => void }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });
  const lx = useMotionValue(0);
  const ly = useMotionValue(0);
  const tagX = useSpring(lx, { stiffness: 300, damping: 30 });
  const tagY = useSpring(ly, { stiffness: 300, damping: 30 });
  const shineX = useTransform(sry, [-8, 8], ['20%', '80%']);
  const shine = useTransform(shineX, (v) => `radial-gradient(600px circle at ${v} 30%, var(--glow), transparent 60%)`);
  const [hover, setHover] = useState(false);


  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 10);
    rx.set(-py * 8);
    lx.set(e.clientX - r.left);
    ly.set(e.clientY - r.top);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    setHover(false);
  };

  return (
    <Reveal as="li" delay={i * 0.08} className="flex flex-col">
      <article className="flex h-full flex-col">
        <div style={{ perspective: 1200 }}>
          <motion.button
            ref={ref}
            type="button"
            onClick={onOpen}
            onPointerMove={onMove}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={onLeave}
            data-cursor="view"
            data-cursor-label="Open"
            aria-label={`Open case study: ${p.title}`}
            style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}
            className="group relative block aspect-[16/11] w-full overflow-hidden rounded-[3px] border border-line text-left"
          >
            <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]">
              <div className="flex h-full min-h-[180px] items-center justify-center bg-surface/50 p-8"><div className="max-w-md text-center"><Terminal className="mx-auto mb-4" size={30}/><p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">Project interface</p><p className="mt-2 text-sm text-muted">Open the case study for the project overview, source repository and local dashboard instructions.</p></div></div>
            </div>
            <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: shine }} />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 hidden font-mono text-[10px] tracking-[0.2em] text-fg uppercase md:block"
              style={{ x: tagX, y: tagY, opacity: hover ? 1 : 0 }}
            >
              <span className="ml-12 block translate-y-5 rounded-full border border-line bg-bg px-3 py-1.5 whitespace-nowrap">Open case study</span>
            </motion.div>
            <span className="absolute top-3 left-3 rounded-full border border-line bg-bg px-2.5 py-0.5 font-mono text-[10px] tracking-[0.18em] text-muted">
              {p.index}
            </span>
          </motion.button>
        </div>

        <div className="flex flex-1 flex-col pt-6">
          <div className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
            <span>{p.kind}</span>
            <span>{p.year}</span>
          </div>
          <h3 className="mt-3 text-[clamp(1.5rem,2vw,1.9rem)] leading-[1.05] font-medium tracking-[-0.035em]">{p.title}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.summary}</p>
          <div className="mt-5 flex items-baseline gap-3 border-t border-line pt-4">
            <span className="text-2xl font-medium tracking-[-0.04em]">{p.metrics[0].value}</span>
            <span className="text-sm text-muted">{p.metrics[0].label}</span>
          </div>
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
            {p.stack.map((s) => (
              <li key={s} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[10.5px] text-muted">
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap items-center gap-5 pt-6">
            <button type="button" onClick={onOpen} className="group inline-flex items-center gap-2 border-b border-fg pb-0.5 text-sm font-medium">
              Case study
              <ArrowRight size={14} className="transition-transform duration-500 group-hover:translate-x-1" />
            </button>
            {p.github ? (
              <a href={p.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg">
                <Github size={14} /> Source
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-faint">
                <Lock size={12} /> Repository link to be configured
              </span>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function CaseStudy({ p, onClose, onNext }: { p: Project; onClose: () => void; onNext: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const next = projects[(projects.indexOf(p) + 1) % projects.length];

  useEffect(() => {
    lockScroll(true);
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [p.id]);

  return (
    <motion.div className="fixed inset-0 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { delay: 0.3 } }}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
        data-lenis-prevent
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-x-0 bottom-0 h-[94svh] overflow-y-auto overscroll-contain rounded-t-[20px] border-t border-line bg-bg"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-4 backdrop-blur md:px-10">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
            Case study {p.index} / 0{projects.length}
          </span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close case study" className="grid h-10 w-10 place-items-center rounded-full border border-line transition-colors hover:bg-fg hover:text-bg">
            <X size={16} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="px-4 pt-10 pb-20 md:px-10 md:pt-16"
          >
            <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
              {p.kind} · {p.year}
            </div>
            <h2 id="case-title" className="mt-4 text-[clamp(2.6rem,8vw,7.5rem)] leading-[0.9] font-medium tracking-[-0.055em]">
              {p.title}
            </h2>
            <p className="mt-8 max-w-[52ch] text-[clamp(1.1rem,1.6vw,1.4rem)] leading-[1.45] text-muted">{p.summary}</p>

            <div className="mt-12 overflow-hidden rounded-[3px] border border-line bg-surface/40 p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">Dashboard access</p><h3 className="mt-2 text-xl font-medium">Run the actual project interface</h3></div>
                <span className="rounded-full border border-line px-3 py-1 font-mono text-[10px] text-muted">LOCAL · PORT {p.dashboardPort}</span>
              </div>
              <p className="mt-4 max-w-[65ch] text-sm leading-relaxed text-muted">This project currently runs on the operator's machine. Start its Python service, then open the dashboard on that same computer. It is not yet a public multi-user dashboard, and this portfolio does not substitute sample metrics for live telemetry.</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <code className="rounded border border-line bg-bg px-3 py-2 font-mono text-xs">{p.runCommand}</code>
                {p.localDashboard && <code className="rounded border border-line bg-bg px-3 py-2 font-mono text-xs">Local URL: {p.localDashboard}</code>}
              </div>
              {p.collectorCommand && <div className="mt-3"><p className="mb-2 font-mono text-[9px] tracking-[0.12em] text-muted uppercase">Linux live log collector · authorized host only</p><code className="block overflow-x-auto rounded border border-line bg-bg px-3 py-2 font-mono text-xs">{p.collectorCommand}</code></div>}
              <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-faint uppercase">This localhost address is for the project operator only. It is not a public dashboard link for portfolio visitors.</p>
            </div>

            <dl className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 md:grid-cols-4">
              {p.metrics.map((m) => (
                <div key={m.label} className="flex flex-col-reverse bg-bg p-6">
                  <dt className="mt-3 text-sm text-muted">{m.label}</dt>
                  <dd className="text-[clamp(2rem,3.4vw,3rem)] leading-none font-medium tracking-[-0.045em]">{m.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 font-mono text-[10px] tracking-[0.15em] text-faint uppercase">Automated project checks and local integration fixtures; not production SOC telemetry</p>

            <div className="mt-16 grid gap-12 md:grid-cols-12 md:gap-6">
              <div className="md:col-span-4">
                <h3 className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">My contribution</h3>
              </div>
              <ul className="space-y-6 md:col-span-8">
                {p.contribution.map((c, i) => (
                  <li key={i} className="grid grid-cols-[auto_1fr] gap-5 border-t border-line pt-6 text-[clamp(1.05rem,1.4vw,1.25rem)] leading-[1.55]">
                    <span className="font-mono text-xs text-faint">0{i + 1}</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-16 grid gap-12 md:grid-cols-12 md:gap-6">
              <div className="md:col-span-4">
                <h3 className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Highlights &amp; stack</h3>
              </div>
              <div className="md:col-span-8">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-lg tracking-[-0.02em]">
                      <span className="h-1.5 w-1.5 rounded-full bg-fg" />
                      {f}
                    </li>
                  ))}
                </ul>
                <ul className="mt-8 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <li key={s} className="rounded-full border border-line px-3.5 py-1.5 font-mono text-xs text-muted">
                      {s}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-wrap gap-3">
                  {p.github ? (
                    <a href={p.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-fg px-5 py-3 text-sm font-medium text-bg">
                      <Github size={15} /> View on GitHub <ArrowUpRight size={14} />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm text-muted">
                      <Lock size={14} /> Repository is private for now
                    </span>
                  )}
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm">
                      Live dashboard <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onNext}
              className="group mt-24 flex w-full items-end justify-between gap-6 border-t border-line pt-8 text-left"
              aria-label={`Next case study: ${next.title}`}
            >
              <span>
                <span className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Next project</span>
                <span className="mt-3 block text-[clamp(2rem,5vw,4.5rem)] leading-[0.95] font-medium tracking-[-0.05em] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-3">
                  {next.title}
                </span>
              </span>
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-line transition-colors group-hover:bg-fg group-hover:text-bg">
                <ArrowRight size={18} />
              </span>
            </button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function Projects() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = projects.find((p) => p.id === openId) ?? null;

  return (
    <section id="projects" className="relative px-4 py-24 md:px-8 md:py-32" aria-labelledby="projects-title">
      <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionLabel index="03">Selected projects</SectionLabel>
          <h2 id="projects-title" className="mt-6 text-[clamp(2rem,4vw,3.6rem)] leading-[0.98] font-medium tracking-[-0.045em]">
            <SplitText text="Systems I've built" className="block" />
            <SplitText text="and shipped." delay={0.12} className="block font-serif font-normal tracking-[-0.03em] italic" />
          </h2>
        </div>
        <p className="max-w-[34ch] text-sm text-muted md:text-right">Two connected defensive-security projects. Open either card for the full case study.</p>
      </div>

      <ul className="mx-auto grid max-w-[1200px] gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-2">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} p={p} i={i} onOpen={() => setOpenId(p.id)} />
        ))}
      </ul>

      <AnimatePresence>
        {open && (
          <CaseStudy
            key="case"
            p={open}
            onClose={() => setOpenId(null)}
            onNext={() => setOpenId(projects[(projects.indexOf(open) + 1) % projects.length].id)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
