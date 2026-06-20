import type { LogEntry, Activity } from '../types';
import { skillDef } from '../skills';

interface Props { log: LogEntry[]; }

const ACT_SKILL: Record<Activity, string> = {
  cardio: 'constitution', bench: 'bench', curl: 'curl', pullups: 'pullups', pushups: 'pushups',
  dips: 'dips', biceps: 'biceps', chest: 'chest', rehab: 'defence', mobility: 'agility', meditate: 'prayer',
};

function relDay(date: string): string {
  const d = new Date(date + 'T00:00:00');
  const diff = Math.round((new Date(new Date().toDateString()).getTime() - d.getTime()) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function summary(e: LogEntry): string {
  switch (e.activity) {
    case 'cardio': return e.minutes != null ? `Treadmill test — ${e.minutes} min` : 'Cardio session';
    case 'bench': return `Bench ${e.weight}lb × ${e.reps}`;
    case 'curl': return `Curl ${e.weight}lb × ${e.reps}`;
    case 'pullups': return `Pull-ups × ${e.reps}`;
    case 'pushups': return `Push-ups × ${e.reps}`;
    case 'dips': return `Dips × ${e.reps}`;
    case 'biceps': return `Biceps ${e.measure} cm`;
    case 'chest': return `Chest ${e.measure} cm`;
    case 'rehab': return 'Back / hand rehab';
    case 'mobility': return 'Mobility / stretch';
    case 'meditate': return e.minutes != null ? `Meditation — ${e.minutes} min` : 'Meditation';
  }
}

export default function SessionLog({ log }: Props) {
  if (log.length === 0) {
    return <p style={{ color: 'var(--ink-faint)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No sessions logged yet. ⚔️</p>;
  }
  const recent = [...log].sort((a, b) => b.ts - a.ts).slice(0, 15);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {recent.map(e => (
        <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 6px', borderBottom: '1px solid rgba(201,168,107,0.07)' }}>
          <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{skillDef(ACT_SKILL[e.activity]).icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink)' }}>{summary(e)}</div>
            {e.note && <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', fontStyle: 'italic', marginTop: 1 }}>{e.note}</div>}
          </div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-faint)', flexShrink: 0 }}>{relDay(e.date)}</div>
        </div>
      ))}
    </div>
  );
}
