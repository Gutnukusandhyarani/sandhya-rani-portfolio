import { motion, useReducedMotion } from 'framer-motion';
import { Activity, AlertTriangle, Fingerprint, ShieldCheck, Terminal } from 'lucide-react';

const telemetry = [
  { time: '14:02:18', source: 'linux.auth', event: 'SSH authentication failures', level: 'HIGH' },
  { time: '14:03:06', source: 'windows.security', event: 'Account event normalized', level: 'INFO' },
  { time: '14:04:42', source: 'file.integrity', event: 'Baseline comparison complete', level: 'LOW' },
];

export default function SecurityVisual() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="security-visual relative mx-auto w-full max-w-[620px]"
      initial={{ opacity: 0, y: 28, rotate: 2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Illustrative security monitoring and detection engineering interface"
    >
      <div className="absolute -inset-10 rounded-full opacity-60 blur-3xl" style={{ background: 'radial-gradient(circle, var(--glow), transparent 68%)' }} />
      <div className="relative overflow-hidden rounded-[5px] border border-line bg-bg/85 shadow-[var(--shadow)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-3 md:px-5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-[9px] tracking-[0.2em] text-muted uppercase">Security workspace</span>
          </div>
          <span className="font-mono text-[9px] tracking-[0.16em] text-faint">LOCAL LAB / ILLUSTRATION</span>
        </div>
        <div className="grid grid-cols-3 gap-px border-b border-line bg-line">
          {[
            { icon: Activity, label: 'EVENTS', value: 'NORMALIZED' },
            { icon: ShieldCheck, label: 'DETECTIONS', value: 'TESTABLE' },
            { icon: Fingerprint, label: 'EVIDENCE', value: 'PRESERVED' },
          ].map((item) => (
            <div key={item.label} className="bg-bg px-3 py-4 md:px-4">
              <item.icon size={15} className="mb-3 text-muted" strokeWidth={1.5} />
              <div className="font-mono text-[8px] tracking-[0.18em] text-faint">{item.label}</div>
              <div className="mt-1 text-[9px] font-medium tracking-[0.08em] md:text-[10px]">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-[1.25fr_.75fr] md:gap-5 md:p-5">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[9px] tracking-[0.18em] text-muted">EVENT STREAM</span>
              <span className="font-mono text-[8px] text-faint">SAMPLE VIEW</span>
            </div>
            <div className="space-y-2">
              {telemetry.map((row, i) => (
                <motion.div
                  key={row.time}
                  className="grid grid-cols-[58px_1fr_auto] items-start gap-2 border border-line bg-surface/70 px-2.5 py-2.5"
                  animate={reduce ? undefined : { opacity: [0.65, 1, 0.65] }}
                  transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7 }}
                >
                  <span className="font-mono text-[8px] text-faint">{row.time}</span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[8px] text-muted">{row.source}</span>
                    <span className="mt-1 block truncate text-[10px]">{row.event}</span>
                  </span>
                  <span className={`font-mono text-[8px] ${row.level === 'HIGH' ? 'text-rose-500' : 'text-muted'}`}>{row.level}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-faint">
              <Terminal size={12}/>
              <span className="font-mono text-[8px] tracking-[0.1em]">COLLECT → NORMALIZE → DETECT</span>
            </div>
          </div>
          <div className="relative flex min-h-[180px] flex-col justify-between overflow-hidden border border-line bg-surface/60 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] tracking-[0.17em] text-muted">RULE PIPELINE</span>
              <AlertTriangle size={14} className="text-muted" />
            </div>
            <div className="relative my-5 flex flex-1 flex-col items-center justify-center gap-3">
              <div className="orbit-ring orbit-ring--one" />
              <div className="orbit-ring orbit-ring--two" />
              <motion.div
                className="relative z-10 grid h-16 w-16 place-items-center rounded-full border border-line bg-bg"
                animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ShieldCheck size={28} strokeWidth={1.2} />
              </motion.div>
              <span className="relative z-10 font-mono text-[8px] tracking-[0.18em] text-muted">DETECTION CORE</span>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-3 font-mono text-[8px] text-faint">
              <span>YAML RULES</span><span>SIEM QUERY</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-line px-4 py-3 md:px-5">
          <span className="font-mono text-[8px] tracking-[0.14em] text-faint">DEFENSIVE SECURITY PORTFOLIO</span>
          <span className="flex items-center gap-2 font-mono text-[8px] tracking-[0.14em] text-muted"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/> TEST ENVIRONMENT</span>
        </div>
      </div>
    </motion.div>
  );
}
