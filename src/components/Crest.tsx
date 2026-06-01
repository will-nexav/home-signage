
import { crestTier, ROMAN } from '../core/constants';

interface CrestProps {
  level: number;
  size?: number;
}

const tierColors: Record<string, { outer: string; inner: string; glow: string }> = {
  common:    { outer: '#6b7280', inner: '#9ca3af', glow: 'rgba(107,114,128,0.4)' },
  rare:      { outer: '#3b82f6', inner: '#93c5fd', glow: 'rgba(59,130,246,0.5)' },
  epic:      { outer: '#8b5cf6', inner: '#c4b5fd', glow: 'rgba(139,92,246,0.5)' },
  legendary: { outer: '#f59e0b', inner: '#fcd34d', glow: 'rgba(245,158,11,0.6)' },
  mythic:    { outer: '#ef4444', inner: '#fca5a5', glow: 'rgba(239,68,68,0.6)' },
};

export default function Crest({ level, size = 80 }: CrestProps) {
  const tier = crestTier(level);
  const colors = tierColors[tier];
  const r = size / 2;

  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id={`cg-${level}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor={colors.inner} />
            <stop offset="100%" stopColor={colors.outer} />
          </radialGradient>
          <filter id={`cglow-${level}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={r} cy={r} r={r - 3} fill="rgba(0,0,0,0.6)" stroke={colors.outer} strokeWidth="2" filter={`url(#cglow-${level})`} />
        <circle cx={r} cy={r} r={r - 8} fill={`url(#cg-${level})`} opacity="0.15" />
        {/* Shield shape */}
        <path
          d={`M ${r} ${r * 0.3} L ${r * 1.5} ${r * 0.55} L ${r * 1.5} ${r * 1.05} Q ${r * 1.5} ${r * 1.5} ${r} ${r * 1.7} Q ${r * 0.5} ${r * 1.5} ${r * 0.5} ${r * 1.05} L ${r * 0.5} ${r * 0.55} Z`}
          fill={`url(#cg-${level})`}
          opacity="0.8"
          filter={`url(#cglow-${level})`}
        />
        <text
          x={r}
          y={r + 5}
          textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize={size * 0.18}
          fontFamily="'Cinzel', serif"
          fontWeight="700"
        >
          {ROMAN[level - 1] || level}
        </text>
      </svg>
    </div>
  );
}
