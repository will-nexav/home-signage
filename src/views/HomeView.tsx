
import CategoryTile from '../components/CategoryTile';
import HabitRow from '../components/HabitRow';
import Panel from '../components/Panel';
import type { AppState } from '../core/types';

interface HomeViewProps {
  state: AppState;
  onCatClick: (catId: string) => void;
  onHabitToggle: (id: string) => void;
  onLateSession: (id: string) => void;
}

export default function HomeView({ state, onCatClick, onHabitToggle, onLateSession }: HomeViewProps) {
  return (
    <div style={{ padding: '20px', maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Quest categories */}
      <div>
        <p className="eyebrow" style={{ marginBottom: 14 }}>Quest Categories</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {state.cats.map(cat => (
            <CategoryTile key={cat.id} cat={cat} onClick={() => onCatClick(cat.id)} />
          ))}
        </div>
      </div>

      {/* Daily habits */}
      <Panel style={{ padding: '18px 20px' }}>
        <p className="eyebrow" style={{ marginBottom: 14 }}>Daily Habits</p>
        {state.habits.map(h => (
          <HabitRow key={h.id} habit={h} onToggle={onHabitToggle} onLateSession={onLateSession} />
        ))}
      </Panel>
    </div>
  );
}
