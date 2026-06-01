
import Panel from '../components/Panel';
import PBar from '../components/PBar';
import EditNum from '../components/EditNum';
import type { HealthState } from '../core/types';

interface HealthViewProps {
  state: HealthState;
  onChange: (s: HealthState) => void;
  onBack: () => void;
}

export default function HealthView({ state, onChange, onBack }: HealthViewProps) {
  function update<K extends keyof HealthState>(key: K, value: HealthState[K]) {
    onChange({ ...state, [key]: value });
  }

  const weightPct = Math.max(0, Math.min(100,
    ((state.weight - 250) / (state.weightTarget - 250)) * 100
  ));
  const vo2Pct = Math.round(state.vo2max / state.vo2maxTarget * 100);
  const sleepPct = Math.round(state.sleep / state.sleepTarget * 100);
  const strPct = Math.round(state.strength / state.strengthTarget * 100);

  return (
    <div style={{ padding: '20px', maxWidth: 700, margin: '0 auto' }}>
      <button className="back-link" onClick={onBack}>← Back</button>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, margin: '0 0 20px', color: 'var(--gold-bright)' }}>
        Health Dashboard
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <Panel style={{ padding: '16px 18px' }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Body Weight</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <EditNum
              value={state.weight}
              onChange={v => update('weight', v)}
              suffix=" lb"
              style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold-bright)' }}
              className="mono"
            />
            <span style={{ color: 'var(--ink-faint)', fontSize: 13 }}>current</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>Target:</span>
            <EditNum value={state.weightTarget} onChange={v => update('weightTarget', v)}
              suffix=" lb" style={{ fontSize: 12, color: 'var(--safe)' }} className="mono" />
          </div>
          <PBar pct={weightPct} bar="linear-gradient(90deg,#82b06a,#a5d08a)" height={6} />
        </Panel>

        <Panel style={{ padding: '16px 18px' }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>VO2 Max</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <EditNum value={state.vo2max} onChange={v => update('vo2max', v)}
              style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold-bright)' }} className="mono" />
            <span style={{ color: 'var(--ink-faint)', fontSize: 13 }}>mL/kg/min</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>Target:</span>
            <EditNum value={state.vo2maxTarget} onChange={v => update('vo2maxTarget', v)}
              style={{ fontSize: 12, color: 'var(--safe)' }} className="mono" />
          </div>
          <PBar pct={vo2Pct} bar="linear-gradient(90deg,#5b7de8,#7c9ef5)" height={6} />
        </Panel>

        <Panel style={{ padding: '16px 18px' }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Sleep</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <EditNum value={state.sleep} onChange={v => update('sleep', v)}
              suffix="h" style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold-bright)' }} className="mono" />
            <span style={{ color: 'var(--ink-faint)', fontSize: 13 }}>avg/night</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>Target:</span>
            <EditNum value={state.sleepTarget} onChange={v => update('sleepTarget', v)}
              suffix="h" style={{ fontSize: 12, color: 'var(--safe)' }} className="mono" />
          </div>
          <PBar pct={sleepPct} bar="linear-gradient(90deg,#8b5ed8,#b07ef5)" height={6} />
        </Panel>

        <Panel style={{ padding: '16px 18px' }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Bench Press</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <EditNum value={state.strength} onChange={v => update('strength', v)}
              suffix=" lb" style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold-bright)' }} className="mono" />
            <span style={{ color: 'var(--ink-faint)', fontSize: 13 }}>1RM</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>Target:</span>
            <EditNum value={state.strengthTarget} onChange={v => update('strengthTarget', v)}
              suffix=" lb" style={{ fontSize: 12, color: 'var(--safe)' }} className="mono" />
          </div>
          <PBar pct={strPct} bar="linear-gradient(90deg,#d87a50,#f5a07e)" height={6} />
        </Panel>
      </div>
    </div>
  );
}
