import { useState } from 'react';
import type { Activity } from '../types';
import { skillDef } from '../skills';

export interface LogInput { activity: Activity; minutes?: number; weight?: number; reps?: number; seconds?: number; note?: string; }

interface Props {
  onConfirm: (input: LogInput) => void;
  onCancel: () => void;
  initialSkill?: string;
}

const LOG_SKILLS: { id: string; acts: Activity[] }[] = [
  { id: 'constitution', acts: ['cardio'] },
  { id: 'attack', acts: ['core'] },
  { id: 'strength', acts: ['bench', 'curl', 'tricep'] },
  { id: 'defence', acts: ['legs'] },
  { id: 'ranged', acts: ['pullups', 'pushups', 'dips'] },
  { id: 'agility', acts: ['mobility'] },
  { id: 'prayer', acts: ['meditate'] },
];
const ACT_SKILL: Record<Activity, string> = {
  cardio: 'constitution', core: 'attack', bench: 'bench', curl: 'curl', tricep: 'tricep',
  pullups: 'pullups', pushups: 'pushups', dips: 'dips', legs: 'defence', mobility: 'agility', meditate: 'prayer',
};
type InputKind = 'minutes' | 'seconds' | 'wr' | 'reps' | 'none';
const INPUT: Record<Activity, InputKind> = {
  cardio: 'minutes', meditate: 'minutes', core: 'seconds',
  bench: 'wr', curl: 'wr', tricep: 'wr', legs: 'wr', pullups: 'reps', pushups: 'reps', dips: 'reps', mobility: 'none',
};

export default function LogSheet({ onConfirm, onCancel, initialSkill }: Props) {
  const [skill, setSkill] = useState(initialSkill && LOG_SKILLS.some(s => s.id === initialSkill) ? initialSkill : 'constitution');
  const acts = LOG_SKILLS.find(s => s.id === skill)!.acts;
  const [activity, setActivity] = useState<Activity>(acts[0]);
  const [minutes, setMinutes] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [seconds, setSeconds] = useState('');
  const [note, setNote] = useState('');

  function pickSkill(id: string) {
    setSkill(id);
    setActivity(LOG_SKILLS.find(s => s.id === id)!.acts[0]);
  }

  const kind = INPUT[activity];
  const canSubmit = kind === 'minutes' || kind === 'none' ? true : kind === 'seconds' ? !!seconds : kind === 'reps' ? !!reps : !!weight && !!reps;

  function submit() {
    const input: LogInput = { activity, note: note.trim() || undefined };
    if (kind === 'minutes' && minutes) input.minutes = parseFloat(minutes);
    if (kind === 'seconds' && seconds) input.seconds = parseFloat(seconds);
    if (kind === 'reps' && reps) input.reps = parseInt(reps);
    if (kind === 'wr') { if (weight) input.weight = parseFloat(weight); if (reps) input.reps = parseInt(reps); }
    onConfirm(input);
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="level-modal pop-in" style={{ maxWidth: 440, width: '100%', padding: 26, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <p className="eyebrow" style={{ color: 'var(--gold)', marginBottom: 12 }}>Log Training</p>

        {/* skill picker */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5, marginBottom: 18 }}>
          {LOG_SKILLS.map(s => {
            const on = skill === s.id, def = skillDef(s.id);
            return (
              <button key={s.id} onClick={() => pickSkill(s.id)} title={def.label} style={tile(on)}>
                <div style={{ fontSize: 17, filter: on ? 'none' : 'grayscale(0.5) opacity(0.8)' }}>{def.icon}</div>
              </button>
            );
          })}
        </div>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--gold-bright)', margin: '0 0 14px' }}>{skillDef(skill).label}</p>

        {/* activity sub-picker */}
        {acts.length > 1 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {acts.map(a => {
              const on = activity === a, def = skillDef(ACT_SKILL[a]);
              return (
                <button key={a} onClick={() => setActivity(a)} style={{ ...tile(on), flex: 1, padding: '8px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span style={{ fontSize: 15 }}>{def.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--serif)' }}>{def.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* inputs */}
        {kind === 'minutes' && (
          <Field label={activity === 'cardio' ? 'Treadmill test — minutes (blank = non-test session)' : 'Meditation — minutes'}>
            <NumInput value={minutes} onChange={setMinutes} placeholder="e.g. 18.5" />
          </Field>
        )}
        {kind === 'seconds' && <Field label="Plank hold — seconds"><NumInput value={seconds} onChange={setSeconds} placeholder="e.g. 90" /></Field>}
        {kind === 'reps' && <Field label="Max consecutive reps"><NumInput value={reps} onChange={setReps} placeholder="e.g. 8" /></Field>}
        {kind === 'wr' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label={activity === 'legs' ? 'Squat load (lb)' : 'Weight / hand (lb)'}><NumInput value={weight} onChange={setWeight} placeholder={activity === 'legs' ? '185' : activity === 'bench' ? '35' : '25'} /></Field>
            <Field label="Reps"><NumInput value={reps} onChange={setReps} placeholder={activity === 'legs' ? '5' : '8'} /></Field>
          </div>
        )}
        {kind === 'none' && (
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 6px' }}>
            Logs a {skillDef(skill).label.toLowerCase()} session — feeds {skillDef(skill).icon} {skillDef(skill).label}.
          </p>
        )}

        <input className="tome-input" style={{ width: '100%', margin: '14px 0 18px' }} placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="ghost-btn" onClick={onCancel}>Cancel</button>
          <button className="levelup-btn" disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.4 }} onClick={submit}>Bank it</button>
        </div>
      </div>
    </div>
  );
}

function tile(on: boolean): React.CSSProperties {
  return {
    cursor: 'pointer', borderRadius: 10, padding: '9px 2px', textAlign: 'center',
    border: on ? '1px solid rgba(236,212,155,0.55)' : '1px solid rgba(201,168,107,0.2)',
    background: on ? 'rgba(236,212,155,0.1)' : 'rgba(0,0,0,0.3)', color: on ? 'var(--gold-bright)' : 'var(--ink-faint)', transition: 'all .15s',
  };
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ flex: 1, marginBottom: 4 }}><p className="eyebrow" style={{ marginBottom: 7 }}>{label}</p>{children}</div>;
}
function NumInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input className="tome-input mono" inputMode="decimal" style={{ width: '100%' }} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value.replace(/[^0-9.]/g, ''))} />;
}
