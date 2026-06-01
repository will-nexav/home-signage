
import Ring from './Ring';
import { accent } from '../core/constants';
import { catStats } from '../core/engine';
import type { Category } from '../core/types';

interface CategoryTileProps {
  cat: Category;
  onClick: () => void;
}

export default function CategoryTile({ cat, onClick }: CategoryTileProps) {
  const stats = catStats(cat);
  const ac = accent(cat.accent);

  return (
    <button className="quest-tile" onClick={onClick}>
      <div style={{
        border: '1px solid rgba(201,168,107,0.16)',
        borderRadius: 14,
        background: 'linear-gradient(160deg,#1e1710 0%,#14100b 80%)',
        padding: 18,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'all .18s',
        boxShadow: 'inset 0 1px 0 rgba(236,212,155,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>{cat.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, color: ac.text, letterSpacing: '0.04em' }}>
              {cat.label}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 2 }}>
              {stats.done}/{stats.total} quests
            </div>
          </div>
          <Ring pct={stats.pct} size={48} stroke={4} color={ac.gem}>
            <span className="mono" style={{ fontSize: 10, color: ac.text, fontWeight: 700 }}>
              {stats.pct}%
            </span>
          </Ring>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="eyebrow">Progress</span>
            <span className="mono" style={{ fontSize: 11, color: ac.text }}>
              {stats.xpEarned}/{stats.xpTotal} XP
            </span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 4, overflow: 'hidden', height: 5 }}>
            <div style={{
              height: '100%',
              width: `${stats.pct}%`,
              background: ac.bar,
              borderRadius: 4,
              transition: 'width 0.6s',
              boxShadow: `0 0 8px ${ac.glow}`,
            }} />
          </div>
        </div>
      </div>
    </button>
  );
}
