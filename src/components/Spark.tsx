

interface SparkProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export default function Spark({ data, width = 80, height = 32, color = '#c9a86b' }: SparkProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
      {/* Last point dot */}
      {data.length > 0 && (() => {
        const last = data[data.length - 1];
        const x = (data.length - 1) * step;
        const y = height - ((last - min) / range) * (height - 4) - 2;
        return <circle cx={x} cy={y} r={3} fill={color} />;
      })()}
    </svg>
  );
}
