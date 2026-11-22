import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { navItems, profile } from '../data/portfolio';
import { scrollToId, lockScroll } from '../lib/scroll';
import { useActiveSection } from '../lib/useActiveSection';

export default function Nav({ ready }: { ready: boolean }) {
  const active = useActiveSection();
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    lockScroll(open);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    window.setTimeout(() => scrollToId(id), open ? 350 : 0);
  };

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[65] pointer-events-none"
        initial={{ y: -40, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        <div
          className={`flex items-center justify-between gap-4 pr-[112px] pl-4 transition-[padding] duration-500 md:pr-[150px] md:pl-8 ${
            compact ? 'pt-3' : 'pt-5 md:pt-7'
          }`}
        >
          <a href="#home" onClick={go('home')} className="pointer-events-auto group flex items-center gap-3" aria-label={`${profile.name} — back to top`}>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-bg font-serif text-xl italic transition-colors group-hover:bg-fg group-hover:text-bg">{profile.initial}</span>
            <span className={`hidden text-sm font-medium tracking-tight transition-all duration-500 sm:block ${compact ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'}`}>
              {profile.name}
            </span>
          </a>

          <nav aria-label="Primary" className="pointer-events-auto hidden md:block">
            <ul
              className={`flex items-center rounded-full border border-line bg-bg/85 backdrop-blur-md transition-all duration-500 ${
                compact ? 'gap-0 p-1 shadow-[var(--shadow)]' : 'gap-1 p-1.5'
              }`}
            >
              {navItems.map((n) => (
                <li key={n.id} className="relative">
                  <a
                    href={`#${n.id}`}
                    onClick={go(n.id)}
                    aria-current={active === n.id ? 'true' : undefined}
                    className={`group/link relative z-10 block rounded-full px-4 py-2 text-[13px] transition-colors duration-300 ${
                      active === n.id ? 'text-bg' : 'text-muted hover:text-fg'
                    }`}
                  >
                    <span className="relative block overflow-hidden">
                      <span className="block transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover/link:-translate-y-full">
                        {n.label}
                        <span className="absolute top-full left-0" aria-hidden="true">{n.label}</span>
                      </span>
                    </span>
                  </a>
                  {active === n.id && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-fg" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="pointer-events-auto flex min-w-9 items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="relative grid h-9 w-9 place-items-center rounded-full border border-line bg-bg md:hidden"
            >
              <span className={`absolute h-px w-4 bg-fg transition-transform duration-500 ${open ? 'rotate-45' : '-translate-y-[3px]'}`} />
              <span className={`absolute h-px w-4 bg-fg transition-transform duration-500 ${open ? '-rotate-45' : 'translate-y-[3px]'}`} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[64] flex flex-col justify-end bg-bg px-6 pb-12 md:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Mobile">
              <ul className="space-y-1">
                {navItems.map((n, i) => (
                  <li key={n.id} className="overflow-hidden">
                    <motion.a
                      href={`#${n.id}`}
                      onClick={go(n.id)}
                      className="flex items-baseline gap-4 py-1 text-[13vw] leading-[1.05] font-medium tracking-[-0.04em]"
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <span className="font-mono text-xs tracking-normal text-muted">0{i + 1}</span>
                      <span className={active === n.id ? 'font-serif font-normal italic' : ''}>{n.label}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-10 flex justify-between border-t border-line pt-6 text-sm text-muted">
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
