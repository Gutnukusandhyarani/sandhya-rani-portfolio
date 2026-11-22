import { motion, useReducedMotion } from 'framer-motion';
import { Shield, Radio, Fingerprint, Code2, Bug } from 'lucide-react';

const nodes = [
  { label: 'TELEMETRY', icon: Radio, angle: -90 },
  { label: 'DETECTION', icon: Shield, angle: -18 },
  { label: 'EVIDENCE', icon: Fingerprint, angle: 54 },
  { label: 'AUTOMATION', icon: Code2, angle: 126 },
  { label: 'VALIDATION', icon: Bug, angle: 198 },
];

export default function SkillConstellation() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto flex aspect-[2/1] w-full max-w-[920px] items-center justify-center overflow-hidden rounded-[3px] border border-line bg-surface/40">
      <div className="constellation-grid absolute inset-0" />
      <div className="constellation-orbit constellation-orbit--outer" />
      <div className="constellation-orbit constellation-orbit--inner" />
      <motion.div className="relative z-10 grid h-20 w-20 place-items-center rounded-full border border-line bg-bg shadow-[var(--shadow)] md:h-28 md:w-28" animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}>
        <Shield size={34} strokeWidth={1.1} className="md:hidden" />
        <Shield size={46} strokeWidth={1.1} className="hidden md:block" />
      </motion.div>
      {nodes.map((n, i) => {
        const r = n.angle * Math.PI / 180;
        const x = 50 + Math.cos(r) * 36;
        const y = 50 + Math.sin(r) * 34;
        return (
          <motion.div
            key={n.label}
            className="absolute z-20 flex items-center gap-2 rounded-full border border-line bg-bg/90 px-3 py-2 shadow-sm backdrop-blur md:px-4 md:py-3"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            animate={reduce ? undefined : { y: [0, i % 2 ? -6 : 6, 0] }}
            transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <n.icon size={13} strokeWidth={1.5} className="text-muted" />
            <span className="font-mono text-[8px] tracking-[0.12em] md:text-[10px]">{n.label}</span>
          </motion.div>
        );
      })}
      <span className="absolute bottom-3 left-3 font-mono text-[8px] tracking-[0.18em] text-faint md:bottom-5 md:left-5">DEFENSIVE ENGINEERING SYSTEM</span>
      <span className="absolute bottom-3 right-3 font-mono text-[8px] tracking-[0.18em] text-faint md:bottom-5 md:right-5">5 CORE STAGES</span>
    </div>
  );
}
