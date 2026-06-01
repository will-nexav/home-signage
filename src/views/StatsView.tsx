
import Panel from '../components/Panel';
import Ring from '../components/Ring';
import PBar from '../components/PBar';
import { overallStats, catStats, habitStats, compositeScore, getLevel, calcNoGamingStreak } from '../core/engine';
import { accent, LEVELS } from '../core/constants';
import type { AppState } from '../core/types';

interface StatsViewProps {
  state: AppState;
}

function TierBar({ level }: { level: number }) {
  const tiers = [
    { name: 'Common',    min: 1,  max: 2,  color: '#6b7280' },
    { name: 'Rare',      min: 3,  max: 5,  color: '#3b82f6' },
    { name: 'Epic',      min: 6,  max: 9,  color: '#8b5cf6' },
    { name: 'Legendary', min: 10, max: 14, color: '#f59e0b' },
    { name: 'Mythic',    min: 15, max: 20, color: '#ef4444' },
  ];
  return (
    <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
      {tiers.map(t => (
        <div key={t.name} style={{ flex: 1 }}>
          <div style={{
            height: 6,
            borderRadius: 3,
            background: level >= t.min ? t.color : 'rgba(0,0,0,0.3)',
            boxShadow: level >= t.min ? `0 0 8px ${t.color}66` : 'none',
            transition: 'all .3s',
          }} />
          <div style={{ fontSize: 9, color: 'var(--ink-faint)', textAlign: 'center', marginTop: 3, fontFamily: 'var(--serif)' }}>
            {t.name}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StatsView({ state }: StatsViewProps) {
  const overall = overallStats(state.cats);
  const score = compositeScore(state.cats, state.habits);
  const lvl = getLevel(state.xp);
  const next = LEVELS[lvl.level] || lvl;
  const xpPct = lvl.max === lvl.min ? 100 : Math.round((state.xp - lvl.min) / (next.min - lvl.min) * 100);
  const habStats = habitStats(state.habits, 7);
  const noGaming = calcNoGamingStreak(state.habits);

  const totalHabDays = Object.values(habStats).reduce((a, b) => a + b, 0);
  const maxHabDays = state.habits.length * 7;
  const habPct = maxHabDays ? Math.round(totalHabDays / maxHabDays * 100) : 0;

  return (
    <div style={{ padding: '20px', maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Level card */}
      <Panel style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <Ring pct={xpPct} size={72} stroke={6} color="#c9a86b">
            <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold-bright)' }}>{state.level}</span>
          </Ring>
          <div style={{ flex: 1 }}>
            <p className="eyebrow" style={{ marginBottom: 4 }}>Level {state.level}</p>
            <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--gold-bright)' }}>{lvl.label}</h3>
            <p style={{ margin: 0, color: 'var(--ink-faint)', fontSize: 12 }}>
              {state.xp.toLocaleString()} / {next.min.toLocaleString()} XP · {xpPct}% to next level
            </p>
          </div>
        </div>
        <PBar pct={xpPct} height={8} />
        <TierBar level={state.level} />
      </Panel>

      {/* Overall stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {[
          { label: 'Quest Score', value: score, icon: '⭐', color: 'var(--gold-bright)' },
          { label: 'Quests Done', value: `${overall.done}/${overall.total}`, icon: '⚔️', color: 'var(--ink)' },
          { label: 'No Gaming', value: `${noGaming}d`, icon: '🛡️', color: '#82b06a' },
        ].map(s => (
          <Panel key={s.label} style={{ padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div className="eyebrow" style={{ marginTop: 4 }}>{s.label}</div>
          </Panel>
        ))}
      </div>

      {/* Category breakdown */}
      <Panel style={{ padding: '18px 22px' }}>
        <p className="eyebrow" style={{ marginBottom: 14 }}>Category Breakdown</p>
        {state.cats.map(cat => {
          const s = catStats(cat);
          const ac = accent(cat.accent);
          return (
            <div key={cat.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span>{cat.icon}</span>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 13, color: ac.text }}>{cat.label}</span>
                </span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{s.done}/{s.total} · {s.xpEarned} XP</span>
              </div>
              <PBar pct={s.pct} bar={ac.bar} height={5} />
            </div>
          );
        })}
      </Panel>

      {/* Habit stats */}
      <Panel style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p className="eyebrow">Habit Consistency (7d)</p>
          <span className="mono" style={{ fontSize: 13, color: 'var(--gold)' }}>{habPct}%</span>
        </div>
        {state.habits.map(h => {
          const days = habStats[h.id] || 0;
          const pct = Math.round(days / 7 * 100);
          return (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{h.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{h.label}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{days}/7</span>
                </div>
                <PBar pct={pct} height={4} />
              </div>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}
