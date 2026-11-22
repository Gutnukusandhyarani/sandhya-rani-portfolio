import Scramble from '../fx/Scramble';

export default function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <div className="flex items-center gap-4 font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
      <span>{index}</span>
      <span className="h-px w-10 bg-line" />
      <Scramble text={children} />
    </div>
  );
}
