
import Crest from './Crest';
import PBar from './PBar';
import { LEVELS } from '../core/constants';
import { getLevel } from '../core/engine';

interface HeaderProps {
  xp: number;
  level: number;
  onNav: (view: string) => void;
  currentView: string;
}

export default function Header({ xp, level, onNav, currentView }: HeaderProps) {
  const lvl = getLevel(xp);
  const next = LEVELS[lvl.level] || lvl;
  const pct = lvl.max === lvl.min ? 100 : Math.round((xp - lvl.min) / (next.min - lvl.min) * 100);

  const tabs = [
    { id: 'home',     label: '⚔ Quests'  },
    { id: 'today',    label: '📅 Today'   },
    { id: 'stats',    label: '📊 Stats'   },
    { id: 'overview', label: '💎 Wealth'  },
  ];

  return (
    <div style={{ padding: '20px 20px 0', maxWidth: 700, margin: '0 auto' }}>
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        <Crest level={level} size={60} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 800, color: 'var(--gold-bright)', letterSpacing: '0.04em' }}>
              Will's Quest Log
            </h1>
            <span className="eyebrow" style={{ color: 'var(--gold)' }}>Season I</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.06em' }}>
              Lvl {level} · {lvl.label}
            </span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', marginLeft: 'auto' }}>
              {xp.toLocaleString()} XP
            </span>
          </div>
          <PBar pct={pct} height={5} style={{ marginTop: 6 }} />
        </div>
      </div>

      {/* Tab row */}
      <div className="tabrow">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab ${currentView === t.id || (t.id === 'home' && currentView === 'category') ? 'tab-active' : ''}`}
            onClick={() => onNav(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
