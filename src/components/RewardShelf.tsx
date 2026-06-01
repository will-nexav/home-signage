
import { REWARDS } from '../core/constants';
import { getLevel } from '../core/engine';
import type { Reward } from '../core/types';

interface RewardShelfProps {
  xp: number;
  onRedeem: (r: Reward) => void;
}

export default function RewardShelf({ xp, onRedeem }: RewardShelfProps) {
  const level = getLevel(xp).level;
  const available = REWARDS.filter(r => !r.unlockLevel || level >= r.unlockLevel);

  if (available.length === 0) return null;

  return (
    <div style={{ padding: '0 20px 16px', maxWidth: 700, margin: '0 auto' }}>
      <p className="eyebrow" style={{ marginBottom: 10 }}>Redeem Rewards</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {available.map(r => (
          <button
            key={r.id}
            className="reward-chip"
            onClick={() => onRedeem(r)}
            disabled={xp < r.xpCost}
            style={{ opacity: xp < r.xpCost ? 0.45 : 1 }}
          >
            <span>{r.icon}</span>
            <span style={{ color: 'var(--ink-soft)' }}>{r.label}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--gold)', borderLeft: '1px solid rgba(201,168,107,0.2)', paddingLeft: 7 }}>
              {r.xpCost} XP
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
