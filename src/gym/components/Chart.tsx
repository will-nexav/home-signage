interface ChartProps {
  points: number[];      // y values in chronological order (cumulative or raw)
  color?: string;
  fill?: string;
  height?: number;
  label?: string;
}

// Lightweight responsive SVG area chart. No deps.
export default function Chart({ points, color = '#c9a86b', fill = 'rgba(201,168,107,0.16)', height = 120, label }: ChartProps) {
  const W = 320, H = height, pad = 6;
  if (points.length < 2) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-faint)', fontSize: 12, border: '1px solid rgba(201,168,107,0.12)', borderRadius: 12 }}>
        Log a couple sessions to see your curve climb.
      </div>
    );
  }
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const n = points.length;
  const xAt = (i: number) => pad + (i / (n - 1)) * (W - pad * 2);
  const yAt = (v: number) => H - pad - ((v - min) / span) * (H - pad * 2);

  const line = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ');
  const area = `${line} L ${xAt(n - 1).toFixed(1)} ${H - pad} L ${xAt(0).toFixed(1)} ${H - pad} Z`;
  const lastX = xAt(n - 1), lastY = yAt(points[n - 1]);

  return (
    <div style={{ border: '1px solid rgba(201,168,107,0.14)', borderRadius: 12, padding: 10, background: 'rgba(0,0,0,0.2)' }}>
      {label && <p className="eyebrow" style={{ marginBottom: 8 }}>{label}</p>}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: 'block' }}>
        <path d={area} fill={fill} />
        <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        <circle cx={lastX} cy={lastY} r={3.5} fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
      </svg>
    </div>
  );
}
