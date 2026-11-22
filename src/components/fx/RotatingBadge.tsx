import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useVelocity } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { scrollToId } from '../../lib/scroll';

const TEXT = 'Security Engineering • Detection as Code • Open to work • ';

/** Circular text badge that spins — faster while you scroll, reversing with scroll direction. */
export default function RotatingBadge({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion();
  const rot = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useVelocity(scrollY);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const v = vel.get();
    const boost = Math.min(10, Math.abs(v) / 150);
    rot.set(rot.get() + (delta / 1000) * 14 * (1 + boost) * (v < -5 ? -1 : 1));
  });

  return (
    <motion.button
      type="button"
      onClick={() => scrollToId('projects')}
      aria-label="Jump to security projects"
      data-cursor="link"
      initial={{ scale: 0, rotate: -90 }}
      animate={ready ? { scale: 1, rotate: 0 } : {}}
      transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 1.3 }}
      whileHover={{ scale: 1.08 }}
      className="group relative grid h-[92px] w-[92px] place-items-center rounded-full border border-line bg-bg/80 backdrop-blur-sm md:h-[120px] md:w-[120px]"
    >
      <motion.svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" style={{ rotate: rot }} aria-hidden="true">
        <defs>
          <path id="badge-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <text fontFamily="var(--font-mono)" fontSize="8.6" letterSpacing="2.4" fill="var(--fg)" style={{ textTransform: 'uppercase' }}>
          <textPath href="#badge-circle">{TEXT}</textPath>
        </text>
      </motion.svg>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-fg text-bg transition-transform duration-500 group-hover:rotate-[-45deg] md:h-11 md:w-11">
        <ArrowDown size={16} />
      </span>
    </motion.button>
  );
}
