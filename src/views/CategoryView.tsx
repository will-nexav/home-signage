
import GroupBlock from '../components/GroupBlock';
import Panel from '../components/Panel';
import Ring from '../components/Ring';
import { catStats } from '../core/engine';
import { accent } from '../core/constants';
import type { Category } from '../core/types';

interface CategoryViewProps {
  cat: Category;
  onToggle: (taskId: string) => void;
  onBack: () => void;
}

export default function CategoryView({ cat, onToggle, onBack }: CategoryViewProps) {
  const stats = catStats(cat);
  const ac = accent(cat.accent);

  return (
    <div style={{ padding: '20px', maxWidth: 700, margin: '0 auto' }}>
      <button className="back-link" onClick={onBack}>← Quests</button>

      <Panel style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 32 }}>{cat.icon}</span>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 4px', fontFamily: 'var(--serif)', fontSize: 20, color: ac.text, letterSpacing: '0.04em' }}>
              {cat.label}
            </h2>
            <p style={{ margin: 0, color: 'var(--ink-faint)', fontSize: 13 }}>
              {stats.done}/{stats.total} complete · {stats.xpEarned}/{stats.xpTotal} XP
            </p>
          </div>
          <Ring pct={stats.pct} size={60} stroke={5} color={ac.gem}>
            <span className="mono" style={{ fontSize: 12, color: ac.text, fontWeight: 700 }}>{stats.pct}%</span>
          </Ring>
        </div>
      </Panel>

      {cat.groups.map(grp => (
        <GroupBlock
          key={grp.id}
          group={grp}
          accentKey={cat.accent}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
