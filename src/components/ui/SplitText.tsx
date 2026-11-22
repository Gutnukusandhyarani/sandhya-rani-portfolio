import { motion, useReducedMotion } from 'framer-motion';
import type { ElementType } from 'react';

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  by?: 'word' | 'char';
  delay?: number;
  stagger?: number;
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean;
};

/** Splits text and slides each piece up from behind a mask. Screen readers get the whole string. */
export default function SplitText({ text, as: Tag = 'span', className = '', by = 'word', delay = 0, stagger, immediate }: Props) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  const step = stagger ?? (by === 'char' ? 0.025 : 0.06);
  let i = 0;
  const trigger = immediate ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, margin: '0px 0px -12% 0px' } };

  return (
    <Tag className={className} aria-label={text}>
      <motion.span initial={reduce ? 'show' : 'hidden'} {...trigger} aria-hidden="true" className="inline">
        {words.map((w, wi) => (
          <span key={wi} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom whitespace-nowrap">
            {(by === 'char' ? w.split('') : [w]).map((piece, pi) => {
              const d = delay + i++ * step;
              return (
                <motion.span
                  key={pi}
                  className="inline-block will-change-transform"
                  variants={{
                    hidden: { y: '110%', rotate: 4 },
                    show: { y: '0%', rotate: 0, transition: { duration: 0.9, delay: d, ease: [0.16, 1, 0.3, 1] } },
                  }}
                >
                  {piece}
                </motion.span>
              );
            })}
            {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
