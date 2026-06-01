import { useState } from 'react';
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

function parsePaste(text: string): { label: string; value: number }[] {
  return text.split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(/[\t,]/).map(p => p.trim());
      const label = parts[0] || 'Item';
      const raw = (parts[1] || '').replace(/[$,\s]/g, '');
      const value = parseFloat(raw) || 0;
      return { label, value };
    })
    .filter(r => r.value !== 0 || r.label !== 'Item');
}

export default function NetWorthView({ state, onChange, onBack }: NetWorthViewProps) {
  const [importMode, setImportMode] = useState<'assets' | 'liabilities' | null>(null);
  const [importText, setImportText] = useState('');
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

  function applyImport() {
    const rows = parsePaste(importText);
    if (!rows.length) return;
    const newItems = rows.map(r => ({ id: uid(), label: r.label, value: r.value }));
    const newSnaps = state.snapshots.map(s => {
      if (s.ym !== ym) return s;
      if (importMode === 'assets') return { ...s, assets: [...s.assets, ...newItems] };
      return { ...s, liabilities: [...s.liabilities, ...newItems] };
    });
    onChange({ ...state, snapshots: newSnaps });
    setImportText('');
    setImportMode(null);
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

      {/* Excel / CSV import */}
      <Panel style={{ padding: '16px 18px', marginTop: 16 }}>
        <p className="eyebrow" style={{ marginBottom: 10 }}>Import from Excel / CSV</p>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 12, lineHeight: 1.5 }}>
          Copy two columns from Excel (Label, Value) and paste below. Tab or comma separated, one row per line.
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button className={`ghost-btn${importMode === 'assets' ? ' tab-active' : ''}`}
            onClick={() => setImportMode(importMode === 'assets' ? null : 'assets')}>
            Import as Assets
          </button>
          <button className={`ghost-btn${importMode === 'liabilities' ? ' tab-active' : ''}`}
            onClick={() => setImportMode(importMode === 'liabilities' ? null : 'liabilities')}>
            Import as Liabilities
          </button>
        </div>
        {importMode && (
          <>
            <textarea
              className="tome-input"
              rows={6}
              style={{ width: '100%', resize: 'vertical', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
              placeholder={"Cash & Checking\t24000\nBrokerage\t38000\nRetirement\t31000"}
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="levelup-btn" onClick={applyImport}>Apply Import</button>
              <button className="ghost-btn" onClick={() => { setImportMode(null); setImportText(''); }}>Cancel</button>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
