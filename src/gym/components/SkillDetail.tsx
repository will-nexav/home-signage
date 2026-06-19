import type { GymSession } from '../types';
import { skillDef, skillLevel, MAX_LEVEL, INTENSITY_LABEL } from '../skills';
import { cumulative } from '../storage';
import PBar from '../../components/PBar';
import Chart from './Chart';

interface Props {
  skillId: string;
  xp: number;
  sessions: GymSession[];
  onBack: () => void;
}

export default function SkillDetail({ skillId, xp, sessions, onBack }: Props) {
  const def = skillDef(skillId);
  const lv = skillLevel(xp);

  // sessions that fed this skill, chronological
  const fed = sessions
    .filter(s => (s.xp[skillId] || 0) > 0)
    .sort((a, b) => a.ts - b.ts);

  // cumulative xp curve
  const curve = cumulative(fed.map(s => s.xp[skillId] || 0));

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 18px 60px' }}>
      <button className="back-link" onClick={onBack}>← Back to skills</button>

      {/* header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 18,
        border: '1px solid rgba(201,168,107,0.2)', borderRadius: 16,
        background: 'radial-gradient(120% 120% at 90% -20%, rgba(236,212,155,0.07), #18120c 70%)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, fontSize: 32, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(236,212,155,0.35)', background: 'rgba(0,0,0,0.35)',
          boxShadow: `0 0 26px -6px ${def.glow}`,
        }}>{def.icon}</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 900, color: 'var(--gold-bright)', margin: 0, letterSpacing: '0.04em' }}>
            {def.label}
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--ink-faint)', margin: '2px 0 0' }}>{def.blurb}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 30, fontWeight: 700, color: 'var(--gold-bright)', lineHeight: 1 }}>{lv.level}</div>
          <p className="eyebrow" style={{ marginTop: 3 }}>/ {MAX_LEVEL}</p>
        </div>
      </div>

      {/* progress to next */}
      <div style={{ marginBottom: 22 }}>
        <PBar pct={lv.pct} bar={def.bar} height={10} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{Math.round(xp).toLocaleString()} xp total</span>
          <span className="mono" style={{ fontSize: 12, color: '#a5e093' }}>
            {lv.maxed ? 'MAXED — skill cape earned 🏆' : `${lv.toNext.toLocaleString()} xp to level ${lv.level + 1}`}
          </span>
        </div>
      </div>

      {/* stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 22 }}>
        <Stat label="Sessions" value={String(fed.length)} />
        <Stat label="Avg / session" value={fed.length ? String(Math.round(xp / fed.length)) : '0'} />
        <Stat label="% to next" value={`${lv.pct}%`} />
      </div>

      <Chart points={curve} color={def.bar.includes('#f5765a') ? '#f5765a' : def.bar.includes('#82c97a') ? '#82c97a' : def.bar.includes('#7c9ef5') ? '#7c9ef5' : '#ecd49b'} label="XP over time" height={130} />

      {/* feeding sessions */}
      <p className="eyebrow" style={{ margin: '24px 0 8px' }}>Sessions that trained {def.label}</p>
      {fed.length === 0 ? (
        <p style={{ color: 'var(--ink-faint)', fontSize: 13 }}>None yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[...fed].reverse().slice(0, 15).map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 6px', borderBottom: '1px solid rgba(201,168,107,0.07)' }}>
              <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                {s.date} · <span className="pill">{INTENSITY_LABEL[s.intensity]}</span>
                {s.note && <span style={{ fontStyle: 'italic', color: 'var(--ink-faint)' }}> — {s.note}</span>}
              </span>
              <span className="mono" style={{ fontSize: 12, color: '#ffe48a', fontWeight: 700 }}>+{s.xp[skillId]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid rgba(201,168,107,0.14)', borderRadius: 11, padding: '12px 8px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
      <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold-bright)', lineHeight: 1 }}>{value}</div>
      <p className="eyebrow" style={{ fontSize: 8, marginTop: 5 }}>{label}</p>
    </div>
  );
}
