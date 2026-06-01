

interface PBarProps {
  pct: number;
  bar?: string;
  height?: number;
  style?: React.CSSProperties;
}

export default function PBar({ pct, bar, height = 6, style }: PBarProps) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: height, overflow: 'hidden', height, ...style }}>
      <div
        style={{
          height: '100%',
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: bar || 'linear-gradient(90deg,#9c7c3e,#c9a86b)',
          borderRadius: height,
          transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
          boxShadow: '0 0 8px rgba(201,168,107,0.4)',
        }}
      />
    </div>
  );
}
