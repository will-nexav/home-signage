import type { GymState, Levels, Activity } from '../types';
import { skillDef, STRENGTH_SUBS, CONS_XP, STRETCH_MOB_XP } from '../skills';
import { skillView, benchmarkSeries, cumulative } from '../storage';
import PBar from '../../components/PBar';
import Chart from './Chart';
import SkillBar from './SkillBar';

interface Props {
  state: GymState;
  id: string;
  levels: Levels;
  onBack: () => void;
  onOpen: (id: string) => void;
  onLog: (activity: Activity) => void;
}

const ID_ACTIVITY: Record<string, Activity> = { endurance: 'cardio', bench: 'bench', curl: 'curl', pullups: 'pullups', mobility: 'stretch' };
const CHART_UNIT: Record<string, string> = { endurance: 'minutes', bench: 'est. 1RM total (lb)', curl: 'est. 1RM/hand (lb)', pullups: 'reps' };

export default function SkillDetail({ state, id, levels, onBack, onOpen, onLog }: Props) {
  const def = skillDef(id);
  const v = skillView(state, id, levels);
  const activity = ID_ACTIVITY[id];

  // chart series
  let series: number[] = [];
  let chartLabel = '';
  if (id === 'constitution') {
    series = cumulative([...state.log].sort((a, b) => a.ts - b.ts).map(e => CONS_XP[e.activity] || 0));
    chartLabel = 'Constitution XP over time';
  } else if (id === 'mobility') {
    series = cumulative([...state.log].filter(e => e.activity === 'stretch').sort((a, b) => a.ts - b.ts).map(() => STRETCH_MOB_XP));
    chartLabel = 'Mobility XP over time';
  } else if (id !== 'strength') {
    series = benchmarkSeries(state.log, activity);
    chartLabel = CHART_UNIT[id];
  }

  const entries = id === 'strength' ? [] :
    [...state.log]
      .filter(e => id === 'constitution' ? true : e.activity === activity)
      .sort((a, b) => b.ts - a.ts).slice(0, 15);

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
            {v.need === 'MAXED' ? 'MAXED — cape earned 🏆' : `next: ${v.need}`}
          </span>
        </div>
      </div>

      {id === 'strength' ? (
        <>
          <p className="eyebrow" style={{ marginBottom: 9 }}>Sub-skills (your Strength is their average)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STRENGTH_SUBS.map(s => (
              <SkillBar key={s} view={skillView(state, s, levels)} onClick={() => onOpen(s)} />
            ))}
          </div>
        </>
      ) : (
        <>
          {activity && (
            <button className="levelup-btn" style={{ width: '100%', marginBottom: 18 }} onClick={() => onLog(activity)}>
              + Log {def.label}
            </button>
          )}
          <Chart points={series} color={def.color} label={chartLabel} height={130} />

          <p className="eyebrow" style={{ margin: '24px 0 8px' }}>History</p>
          {entries.length === 0 ? (
            <p style={{ color: 'var(--ink-faint)', fontSize: 13 }}>Nothing logged yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {entries.map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 6px', borderBottom: '1px solid rgba(201,168,107,0.07)' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                    {e.date}{e.note ? ` · ${e.note}` : ''}
                  </span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--gold-bright)', fontWeight: 700 }}>
                    {e.activity === 'cardio' ? (e.minutes != null ? `${e.minutes} min` : 'session')
                      : e.activity === 'pullups' ? `${e.reps} reps`
                      : e.activity === 'stretch' ? 'stretch'
                      : `${e.weight}×${e.reps}`}
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
