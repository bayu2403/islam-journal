// 8-point khatam (two squares at 45°) nested three deep — Falak's geometry.
export default function Khatam({ className = "fk-khatam" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={0.8} aria-hidden="true">
      {[40, 28, 16].map((r, i) => (
        <g key={r} opacity={1 - i * 0.25}>
          <rect x={50 - r} y={50 - r} width={r * 2} height={r * 2} />
          <rect x={50 - r} y={50 - r} width={r * 2} height={r * 2} transform="rotate(45 50 50)" />
        </g>
      ))}
      <circle cx={50} cy={50} r={46} strokeDasharray="1 3" />
    </svg>
  );
}
