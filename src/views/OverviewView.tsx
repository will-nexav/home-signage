
import Panel from '../components/Panel';
import Ring from '../components/Ring';
import Spark from '../components/Spark';
import { overallStats, compositeScore, useCountTo } from '../core/engine';
import { catStats } from '../core/engine';
import type { AppState, NWState, HealthState, BizState } from '../core/types';
import { money, monthLabel } from '../core/engine';
import { accent } from '../core/constants';

interface OverviewViewProps {
  state: AppState;
  nw: NWState;
  health: HealthState;
  biz: BizState;
  onNav: (view: string) => void;
}

function MiniStat({ label, value, target, icon, color, onClick }: {
  label: string; value: string | number; target?: string | number;
  icon: string; color?: string; onClick?: () => void;
}) {
  return (
    <button
      style={{
        border: '1px solid rgba(201,168,107,0.16)', borderRadius: 12,
        background: 'linear-gradient(160deg,#1e1710 0%,#14100b 80%)',
        padding: '14px 16px', textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
        transition: 'all .15s', flex: 1,
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span className="eyebrow">{label}</span>
      </div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: color || 'var(--gold-bright)' }}>
        {value}
      </div>
      {target !== undefined && (
        <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 2 }}>
          Target: {target}
        </div>
      )}
    </button>
  );
}

export default function OverviewView({ state, nw, health, biz, onNav }: OverviewViewProps) {
  const overall = overallStats(state.cats);
  const score = compositeScore(state.cats, state.habits);
  const animXp = useCountTo(state.xp);

  const latestSnap = nw.snapshots[nw.snapshots.length - 1];
  const netWorth = latestSnap
    ? latestSnap.assets.reduce((s, a) => s + a.value, 0) - latestSnap.liabilities.reduce((s, l) => s + l.value, 0)
    : 0;

  const nwHistory = nw.snapshots.map(s =>
    s.assets.reduce((a, x) => a + x.value, 0) - s.liabilities.reduce((a, x) => a + x.value, 0)
  );

  const totalRevenue = biz.companies.reduce((s, c) => s + c.revenue, 0);
  const totalRevenueTarget = biz.companies.reduce((s, c) => s + c.target, 0);

  return (
    <div style={{ padding: '20px', maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Composite score */}
      <Panel style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Ring pct={score} size={80} stroke={7} color="#c9a86b">
            <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold-bright)' }}>{score}</span>
          </Ring>
          <div style={{ flex: 1 }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>Quest Score</p>
            <h2 style={{ margin: '0 0 4px', fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--gold-bright)' }}>
              Overall Progress
            </h2>
            <p style={{ margin: 0, color: 'var(--ink-faint)', fontSize: 13 }}>
              {overall.done}/{overall.total} quests · {animXp.toLocaleString()} XP earned
            </p>
          </div>
        </div>
      </Panel>

      {/* Category rings */}
      <Panel style={{ padding: '20px 24px' }}>
        <p className="eyebrow" style={{ marginBottom: 16 }}>Quest Categories</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {state.cats.map(cat => {
            const s = catStats(cat);
            const ac = accent(cat.accent);
            return (
              <button key={cat.id}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
                onClick={() => onNav('category:' + cat.id)}
              >
                <Ring pct={s.pct} size={56} stroke={5} color={ac.gem}>
                  <span style={{ fontSize: 18 }}>{cat.icon}</span>
                </Ring>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 11, color: ac.text, letterSpacing: '0.04em' }}>{cat.label}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)' }}>{s.pct}%</span>
              </button>
            );
          })}
        </div>
      </Panel>

      {/* Dashboard tiles */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <MiniStat icon="💰" label="Net Worth" value={money(netWorth)} onClick={() => onNav('networth')} color="#82b06a" />
        <MiniStat icon="🏥" label="Weight" value={`${health.weight} lb`} target={`${health.weightTarget} lb`} onClick={() => onNav('health')} />
        <MiniStat icon="⚡" label="Revenue" value={money(totalRevenue)} target={money(totalRevenueTarget)} onClick={() => onNav('business')} color="#f5a07e" />
      </div>

      {nwHistory.length > 1 && (
        <Panel style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p className="eyebrow">Net Worth Trend</p>
            <span className="mono" style={{ fontSize: 11, color: 'var(--gold)' }}>{money(netWorth)}</span>
          </div>
          <Spark data={nwHistory} width={300} height={40} color="#82b06a" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {nw.snapshots.map(s => (
              <span key={s.ym} className="mono" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>{monthLabel(s.ym)}</span>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
