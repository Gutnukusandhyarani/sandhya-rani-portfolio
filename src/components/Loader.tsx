import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { prefersReducedMotion } from '../lib/theme';
import { profile } from '../data/portfolio';

/** Opening sequence: a counter climbs while the name assembles, then the curtain lifts. */
export default function Loader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisible(false);
      onDone();
      return;
    }
    document.documentElement.style.overflow = 'hidden';
    let raf = 0;
    const start = performance.now();
    const DURATION = 1500;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else
        window.setTimeout(() => {
          setVisible(false);
          document.documentElement.style.overflow = '';
          onDone();
        }, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-bg p-6 text-fg md:p-10"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          role="status"
          aria-label="Loading portfolio"
        >
          <div className="flex justify-between font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
            <span>Portfolio</span>
            <span>©{new Date().getFullYear()}</span>
          </div>
          <div className="overflow-hidden">
            <motion.h2
              className="text-[16vw] leading-[0.85] font-medium tracking-[-0.06em] md:text-[11vw]"
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              {profile.first}<span className="font-serif font-normal italic">.</span>
            </motion.h2>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Preparing security workspace</span>
            <span className="font-mono text-5xl tabular-nums md:text-7xl">{String(count).padStart(3, '0')}</span>
          </div>
          <div className="absolute bottom-0 left-0 h-px bg-fg" style={{ width: `${count}%` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
