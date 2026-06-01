
import Panel from '../components/Panel';
import PBar from '../components/PBar';
import EditNum from '../components/EditNum';
import EditText from '../components/EditText';
import { money } from '../core/engine';
import type { BizState, Company } from '../core/types';

interface BusinessViewProps {
  state: BizState;
  onChange: (s: BizState) => void;
  onBack: () => void;
}

function CompanyCard({ company, onChange }: { company: Company; onChange: (c: Company) => void }) {
  const revPct = Math.min(100, Math.round(company.revenue / company.target * 100));
  const dealPct = Math.min(100, Math.round(company.deals / company.dealTarget * 100));

  return (
    <Panel style={{ padding: '20px 22px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <EditText value={company.name} onChange={v => onChange({ ...company, name: v })}
            style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, color: 'var(--gold-bright)' }} />
          <EditText value={company.role} onChange={v => onChange({ ...company, role: v })}
            style={{ fontSize: 13, color: 'var(--ink-faint)', display: 'block', marginTop: 2 }} />
        </div>
        {company.note && (
          <span style={{ fontSize: 12, color: 'var(--ink-faint)', maxWidth: 180, textAlign: 'right' }}>{company.note}</span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="eyebrow">Revenue</span>
            <EditNum value={company.revenue} onChange={v => onChange({ ...company, revenue: v })}
              format={money} style={{ fontSize: 12, color: '#82b06a' }} className="mono" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>Target</span>
            <EditNum value={company.target} onChange={v => onChange({ ...company, target: v })}
              format={money} style={{ fontSize: 11, color: 'var(--ink-faint)' }} className="mono" />
          </div>
          <PBar pct={revPct} bar="linear-gradient(90deg,#82b06a,#a5d08a)" height={6} />
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)' }}>{revPct}%</span>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="eyebrow">Deals Closed</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--gold)' }}>
              <EditNum value={company.deals} onChange={v => onChange({ ...company, deals: v })}
                style={{ color: 'var(--gold)' }} />
              /{company.dealTarget}
            </span>
          </div>
          <PBar pct={dealPct} bar="linear-gradient(90deg,#d6b25e,#c9a86b)" height={6} />
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)' }}>{dealPct}%</span>
        </div>
      </div>
    </Panel>
  );
}

export default function BusinessView({ state, onChange, onBack }: BusinessViewProps) {
  const totalRevenue = state.companies.reduce((s, c) => s + c.revenue, 0);

  function updateCompany(updated: Company) {
    onChange({ ...state, companies: state.companies.map(c => c.id === updated.id ? updated : c) });
  }

  return (
    <div style={{ padding: '20px', maxWidth: 700, margin: '0 auto' }}>
      <button className="back-link" onClick={onBack}>← Back</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, margin: 0, color: 'var(--gold-bright)' }}>
          Business Dashboard
        </h2>
        <span className="mono" style={{ fontSize: 18, color: '#f5a07e' }}>{money(totalRevenue)} total</span>
      </div>
      {state.companies.map(c => (
        <CompanyCard key={c.id} company={c} onChange={updateCompany} />
      ))}
    </div>
  );
}
