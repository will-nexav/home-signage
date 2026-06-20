import PBar from '../../components/PBar';
import { skillDef, MAX_LEVEL } from '../skills';
import type { SkillView } from '../storage';

interface Props {
  view: SkillView;
  highlight?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export default function SkillBar({ view, highlight, compact, onClick }: Props) {
  const def = skillDef(view.id);
  const dim = view.untested;

  return (
    <div onClick={onClick} className={onClick ? 'skill-row-tap' : undefined} style={{
      display: 'flex', gap: compact ? 10 : 13, alignItems: 'center',
      padding: compact ? '9px 12px' : '12px 14px',
      borderRadius: 12, border: '1px solid rgba(201,168,107,0.16)',
      cursor: onClick ? 'pointer' : 'default',
      opacity: dim ? 0.6 : 1,
      background: highlight
        ? 'linear-gradient(160deg, rgba(236,212,155,0.1), #18120c 80%)'
        : compact ? 'rgba(0,0,0,0.18)' : 'linear-gradient(160deg, #221b13 0%, #18120c 80%)',
      boxShadow: highlight ? `0 0 24px -6px ${def.glow}` : 'inset 0 1px 0 rgba(236,212,155,0.04)',
      transition: 'box-shadow .3s, transform .15s',
    }}>
      <div style={{
        width: compact ? 32 : 42, height: compact ? 32 : 42, borderRadius: 10, flexShrink: 0,
        fontSize: compact ? 16 : 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(201,168,107,0.3)', background: 'rgba(0,0,0,0.35)',
      }}>{def.icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: compact ? 13 : 14, fontWeight: 700, color: 'var(--gold-bright)', letterSpacing: '0.03em' }}>
            {def.label}
          </span>
          <span className="mono" style={{ fontSize: 12 }}>
            <span style={{ color: 'var(--gold-bright)', fontWeight: 700 }}>{view.level}</span>
            <span style={{ color: 'var(--ink-faint)' }}>/{MAX_LEVEL}</span>
          </span>
        </div>
        <PBar pct={view.pct} bar={def.bar} height={compact ? 6 : 7} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, gap: 8 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', whiteSpace: 'nowrap' }}>
            {view.stat}{view.caption ? ` · ${view.caption}` : ''}
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {view.need}
          </span>
        </div>
      </div>
    </div>
  );
}
