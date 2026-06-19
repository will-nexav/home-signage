import { skillDef } from '../skills';

interface Props {
  skillId: string;
  level: number;
  onClose: () => void;
}

const RAY_COUNT = 12;

export default function SkillLevelUpModal({ skillId, level, onClose }: Props) {
  const def = skillDef(skillId);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="level-modal pop-in" style={{ maxWidth: 360, width: '100%', padding: 40, textAlign: 'center', position: 'relative' }}
        onClick={e => e.stopPropagation()}>
        <div className="rays">
          {Array.from({ length: RAY_COUNT }).map((_, i) => (
            <div key={i} className="ray" style={{ transform: `rotate(${i * (360 / RAY_COUNT)}deg)`, animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p className="eyebrow" style={{ color: 'var(--gold)', marginBottom: 18 }}>Level Up!</p>
          <div style={{
            width: 96, height: 96, margin: '0 auto 20px', borderRadius: 22, fontSize: 46,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(236,212,155,0.4)', background: 'rgba(0,0,0,0.35)',
            boxShadow: `0 0 40px -4px ${def.glow}`,
          }}>{def.icon}</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 900, color: 'var(--gold-bright)', margin: '0 0 6px', letterSpacing: '0.05em' }}>
            {def.label}
          </h2>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink-soft)', margin: '0 0 22px' }}>
            advanced to <span style={{ color: 'var(--gold-bright)', fontWeight: 700 }}>level {level}</span>
          </p>
          <button className="levelup-btn" onClick={onClose}>Keep Grinding</button>
        </div>
      </div>
    </div>
  );
}
