import type { GymState } from '../types';
import { skillDef, SUBS, FEATS, PER_SESSION_XP, logSkillFor } from '../skills';
import { skillView, benchmarkSeries, cumulative, magicXp } from '../storage';
import PBar from '../../components/PBar';
import Chart from './Chart';
import SkillBar from './SkillBar';

interface Props {
  state: GymState;
  id: string;
  onBack: () => void;
  onOpen: (id: string) => void;
  onLog: (skillId: string) => void;
  onToggleFeat: (featId: string) => void;
}

export default function SkillDetail({ state, id, onBack, onOpen, onLog, onToggleFeat }: Props) {
  const def = skillDef(id);
  const v = skillView(state, id);
  const activity = def.activity;

  // chart series + history
  let series: number[] = [];
  let chartLabel = '';
  if (def.kind === 'benchmark' && activity) {
    series = benchmarkSeries(state, id);
    chartLabel = `${def.label} over time (${def.unit})`;
  } else if (def.kind === 'consistency' && activity) {
    series = cumulative(state.log.filter(e => e.activity === activity).sort((a, b) => a.ts - b.ts).map(() => PER_SESSION_XP));
    chartLabel = `${def.label} XP over time`;
  }
  const entries = activity ? [...state.log].filter(e => e.activity === activity).sort((a, b) => b.ts - a.ts).slice(0, 15) : [];

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 18px 60px' }}>
      <button className="back-link" onClick={onBack}>← Back to skills</button>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 18,
        border: '1px solid rgba(201,168,107,0.2)', borderRadius: 16,
        background: 'radial-gradient(120% 120% at 90% -20%, rgba(236,212,155,0.07), #18120c 70%)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, fontSize: 32, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(236,212,155,0.35)', background: 'rgba(0,0,0,0.35)', boxShadow: `0 0 26px -6px ${def.glow}`,
        }}>{def.icon}</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 900, color: 'var(--gold-bright)', margin: 0 }}>{def.label}</h2>
          <p style={{ fontSize: 12.5, color: 'var(--ink-faint)', margin: '2px 0 0' }}>{def.blurb}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 30, fontWeight: 700, color: 'var(--gold-bright)', lineHeight: 1 }}>{v.level}</div>
          <p className="eyebrow" style={{ marginTop: 3 }}>{v.caption || '/ 99'}</p>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <PBar pct={v.pct} bar={def.bar} height={10} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{v.stat}</span>
          <span className="mono" style={{ fontSize: 12, color: '#a5e093' }}>
            {v.need === 'MAXED' ? 'MAXED — cape earned 🏆' : v.need ? `next: ${v.need}` : ''}
          </span>
        </div>
      </div>

      {def.kind === 'aggregate' && (
        <>
          <p className="eyebrow" style={{ marginBottom: 9 }}>Sub-skills ({def.label} = their average)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SUBS[id].map(s => <SkillBar key={s} view={skillView(state, s)} onClick={() => onOpen(s)} />)}
          </div>
        </>
      )}

      {def.kind === 'milestone' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <p className="eyebrow">Spellbook of Tricks</p>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{magicXp(state).toLocaleString()} xp</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {FEATS.map(f => {
              const on = state.unlockedFeats.includes(f.id);
              return (
                <button key={f.id} onClick={() => onToggleFeat(f.id)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, cursor: 'pointer',
                  padding: '11px 13px', borderRadius: 10, textAlign: 'left',
                  border: on ? '1px solid rgba(196,163,245,0.5)' : '1px solid rgba(201,168,107,0.14)',
                  background: on ? 'rgba(196,163,245,0.1)' : 'rgba(0,0,0,0.2)', transition: 'all .15s',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 15 }}>{on ? '🔮' : '🔒'}</span>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 13.5, color: on ? 'var(--gold-bright)' : 'var(--ink-soft)' }}>{f.label}</span>
                  </span>
                  <span className="mono" style={{ fontSize: 10.5, color: on ? '#c4a3f5' : 'var(--ink-faint)' }}>T{f.tier} · {f.xp}xp</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {(def.kind === 'benchmark' || def.kind === 'consistency') && (
        <>
          <button className="levelup-btn" style={{ width: '100%', marginBottom: 18 }} onClick={() => onLog(logSkillFor(id))}>
            + Log {def.label}
          </button>
          <Chart points={series} color={def.color} label={chartLabel} height={130} />
          <p className="eyebrow" style={{ margin: '24px 0 8px' }}>History</p>
          {entries.length === 0 ? (
            <p style={{ color: 'var(--ink-faint)', fontSize: 13 }}>Nothing logged yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {entries.map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 6px', borderBottom: '1px solid rgba(201,168,107,0.07)' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{e.date}{e.note ? ` · ${e.note}` : ''}</span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--gold-bright)', fontWeight: 700 }}>
                    {e.minutes != null ? `${e.minutes} min` : e.measure != null ? `${e.measure}"` : e.weight != null ? `${e.weight}×${e.reps}` : e.reps != null ? `${e.reps} reps` : 'session'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
