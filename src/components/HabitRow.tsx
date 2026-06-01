
import Check from './Check';
import type { Habit } from '../core/types';
import { todayStr } from '../core/engine';

interface HabitRowProps {
  habit: Habit;
  onToggle: (id: string) => void;
}

export default function HabitRow({ habit, onToggle }: HabitRowProps) {
  const today = todayStr();
  const done = habit.days.includes(today);

  // Last 7 days
  const days: { str: string; done: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({ str, done: habit.days.includes(str) });
  }

  return (
    <div className="habit-row">
      <Check done={done} variant="habit" onClick={() => onToggle(habit.id)} />
      <span style={{ fontSize: 18, flexShrink: 0 }}>{habit.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: done ? 'var(--ink-soft)' : 'var(--ink)', marginBottom: 5 }}>
          {habit.label}
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {days.map(d => (
            <div
              key={d.str}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: d.done
                  ? 'linear-gradient(135deg,#d6b25e,#9c7c3e)'
                  : 'rgba(0,0,0,0.3)',
                border: `1px solid ${d.done ? 'rgba(236,212,155,0.4)' : 'rgba(201,168,107,0.15)'}`,
              }}
            />
          ))}
        </div>
      </div>
      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', flexShrink: 0 }}>
        +{habit.xp}
      </span>
    </div>
  );
}
