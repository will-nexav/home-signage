

interface SkillTileProps {
  icon: string;
  label: string;
  value: string | number;
  target?: string | number;
  done?: boolean;
  onClick?: () => void;
}

export default function SkillTile({ icon, label, value, target, done, onClick }: SkillTileProps) {
  return (
    <button className="skill-tile" onClick={onClick}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
        <div className={`skill-icon ${done ? 'skill-icon-done' : ''}`}>
          <span style={{ fontSize: 16 }}>{icon}</span>
        </div>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 12, color: 'var(--ink-soft)', letterSpacing: '0.04em', flex: 1 }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: done ? 'var(--gold-bright)' : 'var(--ink)' }}>
          {value}
        </span>
        {target && (
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)' }}>/ {target}</span>
        )}
      </div>
    </button>
  );
}
