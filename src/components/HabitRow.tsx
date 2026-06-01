
import Check from './Check';
import type { Habit } from '../core/types';
import { todayStr } from '../core/engine';

interface HabitRowProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onLateSession?: (id: string) => void;
}

export default function HabitRow({ habit, onToggle, onLateSession }: HabitRowProps) {
  const today = todayStr();
  const done = habit.days.includes(today);
  const isLateToday = (habit.lateSessions || []).includes(today);
  const isWake = habit.id === 'h-wake';

  const days: { str: string; done: boolean; late: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({
      str,
      done: habit.days.includes(str),
      late: (habit.lateSessions || []).includes(str),
    });
  }

  return (
    <div className="habit-row">
      <Check done={done} variant="habit" onClick={() => onToggle(habit.id)} />
      <span style={{ fontSize: 18, flexShrink: 0 }}>{habit.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 14, color: done ? 'var(--ink-soft)' : 'var(--ink)' }}>
            {habit.label}
          </span>
          {isWake && onLateSession && (
            <button
              onClick={() => onLateSession(habit.id)}
              title="Mark tonight as a productive late session — gives you grace on wake time"
              style={{
                fontSize: 11,
                padding: '2px 7px',
                borderRadius: 100,
                border: `1px solid ${isLateToday ? 'rgba(111,182,196,0.6)' : 'rgba(201,168,107,0.2)'}`,
                background: isLateToday ? 'rgba(111,182,196,0.15)' : 'transparent',
                color: isLateToday ? '#a6dbe6' : 'var(--ink-faint)',
                cursor: 'pointer',
                fontFamily: 'var(--serif)',
                letterSpacing: '0.05em',
                transition: 'all .15s',
              }}
            >
              {isLateToday ? '🌙 late session' : '🌙'}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {days.map(d => (
            <div
              key={d.str}
              title={d.late ? 'Productive late session' : undefined}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: d.done
                  ? 'linear-gradient(135deg,#d6b25e,#9c7c3e)'
                  : d.late
                  ? 'rgba(111,182,196,0.25)'
                  : 'rgba(0,0,0,0.3)',
                border: `1px solid ${d.done ? 'rgba(236,212,155,0.4)' : d.late ? 'rgba(111,182,196,0.4)' : 'rgba(201,168,107,0.15)'}`,
                fontSize: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(111,182,196,0.8)',
              }}
            >
              {d.late && !d.done ? '·' : ''}
            </div>
          ))}
        </div>
      </div>
      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', flexShrink: 0 }}>
        +{habit.xp}
      </span>
    </div>
  );
}
