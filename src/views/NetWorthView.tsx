import Panel from '../components/Panel';
import Spark from '../components/Spark';
import EditNum from '../components/EditNum';
import EditText from '../components/EditText';
import { money, monthLabel, currentYM } from '../core/engine';
import type { NWState, NWAsset, NWLiability } from '../core/types';

interface NetWorthViewProps {
  state: NWState;
  onChange: (s: NWState) => void;
  onBack: () => void;
}

let idCtr = Date.now();

function uid() { return `nw-${++idCtr}`; }

export default function NetWorthView({ state, onChange, onBack }: NetWorthViewProps) {
  const ym = currentYM();
  let snap = state.snapshots.find(s => s.ym === ym);
  if (!snap) {
    const prev = state.snapshots[state.snapshots.length - 1];
    snap = {
      ym,
      assets: prev ? prev.assets.map(a => ({ ...a, id: uid() })) : [],
      liabilities: prev ? prev.liabilities.map(l => ({ ...l, id: uid() })) : [],
    };
    onChange({ ...state, snapshots: [...state.snapshots, snap] });
    return null;
  }

  const totalAssets = snap.assets.reduce((s, a) => s + a.value, 0);
  const totalLiab = snap.liabilities.reduce((s, l) => s + l.value, 0);
  const netWorth = totalAssets - totalLiab;

  const nwHistory = state.snapshots.map(s =>
    s.assets.reduce((a, x) => a + x.value, 0) - s.liabilities.reduce((a, x) => a + x.value, 0)
  );

  function updateAsset(id: string, field: keyof NWAsset, value: string | number) {
    const newSnaps = state.snapshots.map(s => s.ym === ym
      ? { ...s, assets: s.assets.map(a => a.id === id ? { ...a, [field]: value } : a) }
      : s);
    onChange({ ...state, snapshots: newSnaps });
  }

  function updateLiab(id: string, field: keyof NWLiability, value: string | number) {
    const newSnaps = state.snapshots.map(s => s.ym === ym
      ? { ...s, liabilities: s.liabilities.map(l => l.id === id ? { ...l, [field]: value } : l) }
      : s);
    onChange({ ...state, snapshots: newSnaps });
  }

  function addAsset() {
    const newSnaps = state.snapshots.map(s => s.ym === ym
      ? { ...s, assets: [...s.assets, { id: uid(), label: 'New Asset', value: 0 }] }
      : s);
    onChange({ ...state, snapshots: newSnaps });
  }

  function addLiab() {
    const newSnaps = state.snapshots.map(s => s.ym === ym
      ? { ...s, liabilities: [...s.liabilities, { id: uid(), label: 'New Liability', value: 0 }] }
      : s);
    onChange({ ...state, snapshots: newSnaps });
  }

  function deleteAsset(id: string) {
    const newSnaps = state.snapshots.map(s => s.ym === ym
      ? { ...s, assets: s.assets.filter(a => a.id !== id) }
      : s);
    onChange({ ...state, snapshots: newSnaps });
  }

  function deleteLiab(id: string) {
    const newSnaps = state.snapshots.map(s => s.ym === ym
      ? { ...s, liabilities: s.liabilities.filter(l => l.id !== id) }
      : s);
    onChange({ ...state, snapshots: newSnaps });
  }

  return (
    <div style={{ padding: '20px', maxWidth: 700, margin: '0 auto' }}>
      <button className="back-link" onClick={onBack}>← Back</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, margin: 0, color: 'var(--gold-bright)' }}>Net Worth</h2>
        <span className="mono" style={{ fontSize: 24, fontWeight: 700, color: netWorth >= 0 ? '#82b06a' : '#c2545a' }}>
          {money(netWorth)}
        </span>
      </div>

      {nwHistory.length > 1 && (
        <Panel style={{ padding: '16px 20px', marginBottom: 16 }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>History</p>
          <Spark data={nwHistory} width={340} height={50} color="#82b06a" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {state.snapshots.map(s => (
              <span key={s.ym} className="mono" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>{monthLabel(s.ym)}</span>
            ))}
          </div>
        </Panel>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Assets */}
        <Panel style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p className="eyebrow">Assets</p>
            <span className="mono" style={{ fontSize: 13, color: '#82b06a' }}>{money(totalAssets)}</span>
          </div>
          {snap.assets.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <EditText value={a.label} onChange={v => updateAsset(a.id, 'label', v)}
                  style={{ fontSize: 12, color: 'var(--ink-soft)' }} />
              </div>
              <EditNum value={a.value} onChange={v => updateAsset(a.id, 'value', v)}
                prefix="$" style={{ fontSize: 12, color: '#82b06a' }} />
              <button className="row-act row-act-del" style={{ opacity: 1 }} onClick={() => deleteAsset(a.id)}>✕</button>
            </div>
          ))}
          <button className="ghost-btn" style={{ marginTop: 8, width: '100%' }} onClick={addAsset}>+ Add Asset</button>
        </Panel>

        {/* Liabilities */}
        <Panel style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p className="eyebrow">Liabilities</p>
            <span className="mono" style={{ fontSize: 13, color: '#c2545a' }}>{money(totalLiab)}</span>
          </div>
          {snap.liabilities.map(l => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <EditText value={l.label} onChange={v => updateLiab(l.id, 'label', v)}
                  style={{ fontSize: 12, color: 'var(--ink-soft)' }} />
              </div>
              <EditNum value={l.value} onChange={v => updateLiab(l.id, 'value', v)}
                prefix="$" style={{ fontSize: 12, color: '#c2545a' }} />
              <button className="row-act row-act-del" style={{ opacity: 1 }} onClick={() => deleteLiab(l.id)}>✕</button>
            </div>
          ))}
          <button className="ghost-btn" style={{ marginTop: 8, width: '100%' }} onClick={addLiab}>+ Add Liability</button>
        </Panel>
      </div>
    </div>
  );
}
