import PBar from '../../components/PBar';
import { skillDef, skillLevel, MAX_LEVEL } from '../skills';

interface SkillBarProps {
  id: string;
  xp: number;
  highlight?: boolean;
  onClick?: () => void;
}

export default function SkillBar({ id, xp, highlight, onClick }: SkillBarProps) {
  const def = skillDef(id);
  const lv = skillLevel(xp);

  return (
    <div onClick={onClick} className={onClick ? 'skill-row-tap' : undefined} style={{
      display: 'flex', gap: 13, alignItems: 'center', padding: '12px 14px',
      borderRadius: 12, border: '1px solid rgba(201,168,107,0.16)',
      cursor: onClick ? 'pointer' : 'default',
      background: highlight
        ? `linear-gradient(160deg, rgba(236,212,155,0.08), #18120c 80%)`
        : 'linear-gradient(160deg, #221b13 0%, #18120c 80%)',
      boxShadow: highlight ? `0 0 24px -6px ${def.glow}` : 'inset 0 1px 0 rgba(236,212,155,0.04)',
      transition: 'box-shadow .3s, transform .15s',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10, flexShrink: 0, fontSize: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(201,168,107,0.3)', background: 'rgba(0,0,0,0.35)',
      }}>{def.icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, color: 'var(--gold-bright)', letterSpacing: '0.04em' }}>
            {def.label}
          </span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
            <span style={{ color: 'var(--gold-bright)', fontWeight: 700 }}>{lv.level}</span>
            <span style={{ color: 'var(--ink-faint)' }}>/{MAX_LEVEL}</span>
          </span>
        </div>
        <PBar pct={lv.pct} bar={def.bar} height={7} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)' }}>
            {Math.round(xp).toLocaleString()} xp
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)' }}>
            {lv.maxed ? 'MAXED' : `${lv.toNext.toLocaleString()} to ${lv.level + 1}`}
          </span>
        </div>
      </div>
    </div>
  );
}
