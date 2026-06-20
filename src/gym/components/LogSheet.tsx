import { useState } from 'react';
import type { Activity } from '../types';
import { skillDef } from '../skills';

export interface LogInput { activity: Activity; minutes?: number; weight?: number; reps?: number; note?: string; }

interface Props {
  onConfirm: (input: LogInput) => void;
  onCancel: () => void;
  initial?: Activity;
}

const ACTIVITIES: { id: Activity; label: string; icon: string }[] = [
  { id: 'cardio', label: 'Cardio', icon: '🏃' },
  { id: 'bench', label: 'Bench', icon: '🏋️' },
  { id: 'curl', label: 'Curl', icon: '💪' },
  { id: 'pullups', label: 'Pull-ups', icon: '🧗' },
  { id: 'stretch', label: 'Stretch', icon: '🧘' },
];

export default function LogSheet({ onConfirm, onCancel, initial }: Props) {
  const [activity, setActivity] = useState<Activity>(initial || 'cardio');
  const [minutes, setMinutes] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [note, setNote] = useState('');

  function submit() {
    const input: LogInput = { activity, note: note.trim() || undefined };
    if (activity === 'cardio' && minutes) input.minutes = parseFloat(minutes);
    if ((activity === 'bench' || activity === 'curl')) {
      if (weight) input.weight = parseFloat(weight);
      if (reps) input.reps = parseInt(reps);
    }
    if (activity === 'pullups' && reps) input.reps = parseInt(reps);
    onConfirm(input);
  }

  const canSubmit =
    activity === 'cardio' ? true :
    activity === 'stretch' ? true :
    activity === 'pullups' ? !!reps :
    !!weight && !!reps;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="level-modal pop-in" style={{ maxWidth: 440, width: '100%', padding: 28, position: 'relative' }}
        onClick={e => e.stopPropagation()}>
        <p className="eyebrow" style={{ color: 'var(--gold)', marginBottom: 14 }}>Log Training</p>

        {/* activity picker */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, marginBottom: 22 }}>
          {ACTIVITIES.map(a => {
            const on = activity === a.id;
            return (
              <button key={a.id} onClick={() => setActivity(a.id)} style={{
                cursor: 'pointer', borderRadius: 10, padding: '9px 2px', textAlign: 'center',
                border: on ? '1px solid rgba(236,212,155,0.55)' : '1px solid rgba(201,168,107,0.2)',
                background: on ? 'rgba(236,212,155,0.1)' : 'rgba(0,0,0,0.3)',
                color: on ? 'var(--gold-bright)' : 'var(--ink-faint)', transition: 'all .15s', fontFamily: 'var(--serif)',
              }}>
                <div style={{ fontSize: 19, marginBottom: 3, filter: on ? 'none' : 'grayscale(0.5) opacity(0.8)' }}>{a.icon}</div>
                <div style={{ fontSize: 9.5, fontWeight: 700 }}>{a.label}</div>
              </button>
            );
          })}
        </div>

        {/* inputs by activity */}
        {activity === 'cardio' && (
          <Field label="Treadmill test result — minutes (leave blank for a non-test session)">
            <NumInput value={minutes} onChange={setMinutes} placeholder="e.g. 18.5" />
          </Field>
        )}
        {(activity === 'bench' || activity === 'curl') && (
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Weight per hand (lb)"><NumInput value={weight} onChange={setWeight} placeholder={skillDef(activity).id === 'bench' ? '35' : '25'} /></Field>
            <Field label="Reps"><NumInput value={reps} onChange={setReps} placeholder="8" /></Field>
          </div>
        )}
        {activity === 'pullups' && (
          <Field label="Max consecutive reps"><NumInput value={reps} onChange={setReps} placeholder="2" /></Field>
        )}
        {activity === 'stretch' && (
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 6px' }}>
            Logs a stretch/movement session — feeds 🧘 Mobility (back + hand) and ❤️ Constitution.
          </p>
        )}

        <input className="tome-input" style={{ width: '100%', margin: '14px 0 20px' }}
          placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="ghost-btn" onClick={onCancel}>Cancel</button>
          <button className="levelup-btn" disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.4 }} onClick={submit}>
            Bank it
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, marginBottom: 4 }}>
      <p className="eyebrow" style={{ marginBottom: 7 }}>{label}</p>
      {children}
    </div>
  );
}

function NumInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input className="tome-input mono" inputMode="decimal" style={{ width: '100%' }}
      value={value} placeholder={placeholder} onChange={e => onChange(e.target.value.replace(/[^0-9.]/g, ''))} />
  );
}
