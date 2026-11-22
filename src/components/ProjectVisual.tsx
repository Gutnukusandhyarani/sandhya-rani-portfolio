import type { Project } from '../data/portfolio';

/**
 * Generative monochrome previews — one per project — drawn in SVG so they're crisp,
 * tiny, and follow the theme. They illustrate what each system does rather than
 * pretending to be screenshots.
 */
export default function ProjectVisual({ motif, cover = false }: { motif: Project['motif']; cover?: boolean }) {
  return (
    <svg viewBox="0 0 800 560" preserveAspectRatio={cover ? 'xMidYMid slice' : 'xMidYMid meet'} className="h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={`grid-${motif}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="var(--line)" strokeWidth="1" />
        </pattern>
        <linearGradient id="beam" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--fg)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--fg)" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <rect width="800" height="560" fill="var(--surface)" />
      <rect width="800" height="560" fill={`url(#grid-${motif})`} opacity="0.6" />
      {motif === 'scan' && <Scan />}
      {motif === 'flow' && <Flow />}
      {motif === 'tenants' && <Tenants />}
      <style>{`
        @keyframes pv-scan { 0% { transform: translateY(0) } 100% { transform: translateY(300px) } }
        @keyframes pv-blink { 0%,100% { opacity: .15 } 50% { opacity: 1 } }
        @keyframes pv-dash { to { stroke-dashoffset: -40 } }
        @keyframes pv-pop { 0%, 20% { opacity: 0; transform: translateY(8px) } 30%, 85% { opacity: 1; transform: none } 100% { opacity: 0 } }
        @media (prefers-reduced-motion: reduce) { svg * { animation: none !important } }
      `}</style>
    </svg>
  );
}

function Scan() {
  const lines = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <g>
      {/* stacked documents */}
      <rect x="236" y="96" width="270" height="360" rx="6" fill="var(--surface-2)" stroke="var(--line)" transform="rotate(-6 371 276)" />
      <rect x="250" y="86" width="270" height="360" rx="6" fill="var(--bg)" stroke="var(--line)" />
      <rect x="276" y="114" width="120" height="10" rx="5" fill="var(--fg)" />
      {lines.map((i) => (
        <rect
          key={i}
          x="276"
          y={144 + i * 26}
          width={i % 3 === 2 ? 150 : 218}
          height="7"
          rx="3.5"
          fill={i === 3 || i === 6 ? 'var(--fg)' : 'var(--line)'}
          style={i === 3 || i === 6 ? { animation: `pv-blink 3s ${i * 0.2}s ease-in-out infinite` } : undefined}
        />
      ))}
      {/* scanning beam */}
      <g style={{ animation: 'pv-scan 3s cubic-bezier(.65,0,.35,1) infinite alternate' }}>
        <rect x="250" y="86" width="270" height="44" fill="url(#beam)" />
        <rect x="250" y="129" width="270" height="1.5" fill="var(--fg)" />
      </g>
      {/* extracted Q&A */}
      <g style={{ animation: 'pv-pop 6s ease-in-out infinite' }}>
        <rect x="548" y="150" width="196" height="64" rx="12" fill="var(--fg)" />
        <text x="566" y="177" fontFamily="var(--font-mono)" fontSize="11" fill="var(--bg)" letterSpacing="1">SSH · AUTH FAILURE</text>
        <rect x="566" y="190" width="120" height="6" rx="3" fill="var(--bg)" opacity=".5" />
      </g>
      <g style={{ animation: 'pv-pop 6s 1.2s ease-in-out infinite' }}>
        <rect x="548" y="228" width="196" height="88" rx="12" fill="var(--bg)" stroke="var(--line)" />
        <text x="566" y="255" fontFamily="var(--font-mono)" fontSize="11" fill="var(--muted)" letterSpacing="1">ALERT · EVIDENCE</text>
        <rect x="566" y="270" width="160" height="6" rx="3" fill="var(--line)" />
        <rect x="566" y="284" width="130" height="6" rx="3" fill="var(--line)" />
        <rect x="566" y="298" width="90" height="6" rx="3" fill="var(--line)" />
      </g>
      <text x="56" y="508" fontFamily="var(--font-mono)" fontSize="12" fill="var(--muted)" letterSpacing="2">ENDPOINT · TELEMETRY · INTEGRITY</text>
    </g>
  );
}

function Flow() {
  const node = (x: number, y: number, label: string, solid = false) => (
    <g>
      <rect x={x - 82} y={y - 30} width="164" height="60" rx="30" fill={solid ? 'var(--fg)' : 'var(--bg)'} stroke="var(--fg)" strokeOpacity={solid ? 1 : 0.4} />
      <text x={x} y={y + 5} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" letterSpacing="2" fill={solid ? 'var(--bg)' : 'var(--fg)'}>
        {label}
      </text>
    </g>
  );
  const path = (d: string, delay = 0) => (
    <>
      <path d={d} fill="none" stroke="var(--line)" strokeWidth="2" />
      <path d={d} fill="none" stroke="var(--fg)" strokeWidth="2" strokeDasharray="4 16" style={{ animation: `pv-dash 1.2s ${delay}s linear infinite` }} />
    </>
  );
  return (
    <g>
      {path('M 180 280 C 260 280, 280 280, 330 280')}
      {path('M 494 280 C 560 280, 560 170, 618 170', 0.3)}
      {path('M 494 280 C 560 280, 560 390, 618 390', 0.6)}
      {node(110, 280, 'CREATED')}
      {node(412, 280, 'PROCESSING', true)}
      {node(690, 170, 'SUCCESS')}
      {node(690, 390, 'FAILED')}
      <g style={{ animation: 'pv-blink 2.4s ease-in-out infinite' }}>
        <circle cx="690" cy="122" r="5" fill="var(--fg)" />
      </g>
      <text x="56" y="80" fontFamily="var(--font-mono)" fontSize="12" fill="var(--muted)" letterSpacing="2">YAML RULES · ATT&CK</text>
      <text x="56" y="508" fontFamily="var(--font-mono)" fontSize="12" fill="var(--muted)" letterSpacing="2">VALIDATE · TEST · COMPILE · EXPORT</text>
    </g>
  );
}

function Tenants() {
  const cells = Array.from({ length: 18 }, (_, i) => i);
  return (
    <g>
      {cells.map((i) => {
        const c = i % 6;
        const r = Math.floor(i / 6);
        const x = 120 + c * 96;
        const y = 120 + r * 104;
        const lit = [2, 7, 15].includes(i);
        return (
          <g key={i}>
            <rect x={x} y={y} width="80" height="84" rx="8" fill={lit ? 'var(--fg)' : 'var(--bg)'} stroke="var(--fg)" strokeOpacity={lit ? 1 : 0.22} style={lit ? undefined : { animation: `pv-blink 4s ${(i * 0.37) % 4}s ease-in-out infinite` }} />
            <text x={x + 12} y={y + 24} fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1" fill={lit ? 'var(--bg)' : 'var(--muted)'}>
              T{String(i + 1).padStart(2, '0')}
            </text>
            <rect x={x + 12} y={y + 54} width="40" height="5" rx="2.5" fill={lit ? 'var(--bg)' : 'var(--line)'} />
          </g>
        );
      })}
      <rect x="104" y="104" width="592" height="336" rx="14" fill="none" stroke="var(--fg)" strokeDasharray="6 8" strokeOpacity="0.5" style={{ animation: 'pv-dash 2s linear infinite' }} />
      <text x="56" y="80" fontFamily="var(--font-mono)" fontSize="12" fill="var(--muted)" letterSpacing="2">RULE METADATA · FIELD MAPPING</text>
      <text x="56" y="508" fontFamily="var(--font-mono)" fontSize="12" fill="var(--muted)" letterSpacing="2">SPL · KQL · ELASTIC</text>
    </g>
  );
}
