import { useCallback, useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

const GLYPHS = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Decodes its text from random glyphs when scrolled into view, and again on hover. */
export default function Scramble({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const [out, setOut] = useState(text);
  const raf = useRef(0);

  const run = useCallback(() => {
    if (reduce) return;
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const DUR = 700;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DUR);
      const reveal = Math.floor(p * text.length);
      setOut(
        text
          .split('')
          .map((c, i) => (i < reveal || c === ' ' ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      );
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [text, reduce]);

  useEffect(() => {
    if (inView) run();
  }, [inView, run]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <span ref={ref} className={className} onPointerEnter={run} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </span>
  );
}
