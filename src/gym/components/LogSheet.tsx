import { useState } from 'react';
import type { Intensity } from '../types';
import { TRAINABLE, INTENSITY_XP, INTENSITY_LABEL, SHOWUP_XP, skillDef } from '../skills';

interface Props {
  onConfirm: (skills: string[], intensity: Intensity, note: string) => void;
  onCancel: () => void;
}

const INTENSITIES: Intensity[] = ['light', 'solid', 'beast'];

export default function LogSheet({ onConfirm, onCancel }: Props) {
  const [skills, setSkills] = useState<string[]>(['strength']);
  const [intensity, setIntensity] = useState<Intensity>('solid');
  const [note, setNote] = useState('');

  function toggle(id: string) {
    setSkills(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  const perSkill = INTENSITY_XP[intensity];
  const totalPreview = SHOWUP_XP + skills.length * perSkill;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="level-modal pop-in" style={{ maxWidth: 440, width: '100%', padding: 30, position: 'relative' }}
        onClick={e => e.stopPropagation()}>
        <p className="eyebrow" style={{ color: 'var(--gold)', marginBottom: 4 }}>Log Training Session</p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 800, color: 'var(--gold-bright)', margin: '0 0 18px' }}>
          You showed up. ❤️ +{SHOWUP_XP} Constitution
        </h2>

        <p className="eyebrow" style={{ marginBottom: 9 }}>What did you train?</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {TRAINABLE.map(s => {
            const on = skills.includes(s.id);
            return (
              <button key={s.id} onClick={() => toggle(s.id)} style={{
                cursor: 'pointer', borderRadius: 11, padding: '12px 6px', textAlign: 'center',
                border: on ? '1px solid rgba(236,212,155,0.55)' : '1px solid rgba(201,168,107,0.2)',
                background: on ? 'rgba(236,212,155,0.1)' : 'rgba(0,0,0,0.3)',
                color: on ? 'var(--gold-bright)' : 'var(--ink-faint)',
                transition: 'all .15s', fontFamily: 'var(--serif)',
              }}>
                <div style={{ fontSize: 24, marginBottom: 4, filter: on ? 'none' : 'grayscale(0.6) opacity(0.7)' }}>{s.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{s.label}</div>
              </button>
            );
          })}
        </div>

        <p className="eyebrow" style={{ marginBottom: 9 }}>Intensity</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {INTENSITIES.map(it => {
            const on = intensity === it;
            return (
              <button key={it} onClick={() => setIntensity(it)} style={{
                cursor: 'pointer', borderRadius: 11, padding: '11px 6px', textAlign: 'center',
                border: on ? '1px solid rgba(236,212,155,0.55)' : '1px solid rgba(201,168,107,0.2)',
                background: on ? 'rgba(236,212,155,0.1)' : 'rgba(0,0,0,0.3)',
                color: on ? 'var(--gold-bright)' : 'var(--ink-faint)',
                transition: 'all .15s', fontFamily: 'var(--serif)',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{INTENSITY_LABEL[it]}</div>
                <div className="mono" style={{ fontSize: 10, marginTop: 3, opacity: 0.8 }}>+{INTENSITY_XP[it]}/skill</div>
              </button>
            );
          })}
        </div>

        <input
          className="tome-input"
          style={{ width: '100%', marginBottom: 20 }}
          placeholder="Note (optional) — e.g. bench PR, 5k run…"
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span className="mono" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            Total this session: <span style={{ color: '#ffe48a', fontWeight: 700 }}>+{totalPreview} XP</span>
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ghost-btn" onClick={onCancel}>Cancel</button>
            <button className="levelup-btn" onClick={() => onConfirm(skills, intensity, note.trim())}>
              Bank it
            </button>
          </div>
        </div>

        {skills.length > 0 && (
          <p style={{ marginTop: 12, fontSize: 11, color: 'var(--ink-faint)', textAlign: 'right' }}>
            {skills.map(id => `${skillDef(id).label} +${perSkill}`).join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
}
