import type { GymSession } from '../types';
import { skillDef, INTENSITY_LABEL, CONSTITUTION } from '../skills';

interface Props {
  sessions: GymSession[];
}

function relDay(date: string): string {
  const today = new Date();
  const d = new Date(date + 'T00:00:00');
  const diff = Math.round((new Date(today.toDateString()).getTime() - d.getTime()) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function SessionLog({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <p style={{ color: 'var(--ink-faint)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
        No sessions banked yet. Hit the gym and log your first one. ⚔️
      </p>
    );
  }

  const recent = [...sessions].sort((a, b) => b.ts - a.ts).slice(0, 12);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {recent.map(s => {
        const total = Object.values(s.xp).reduce((a, b) => a + b, 0);
        const trained = s.skills.filter(id => id !== CONSTITUTION);
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 8px', borderRadius: 9, borderBottom: '1px solid rgba(201,168,107,0.07)' }}>
            <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>❤️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink)' }}>
                  {trained.length ? trained.map(id => skillDef(id).icon).join(' ') : 'Showed up'}
                </span>
                <span className="pill">{INTENSITY_LABEL[s.intensity]}</span>
              </div>
              {s.note && <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', fontStyle: 'italic', marginTop: 2 }}>{s.note}</div>}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="mono" style={{ fontSize: 12, color: '#ffe48a', fontWeight: 700 }}>+{total}</div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-faint)' }}>{relDay(s.date)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
