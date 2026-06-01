
import Crest from './Crest';
import { ROMAN } from '../core/constants';
import type { LevelInfo } from '../core/types';

interface LevelUpModalProps {
  levelInfo: LevelInfo;
  onClose: () => void;
}

const RAY_COUNT = 12;

export default function LevelUpModal({ levelInfo, onClose }: LevelUpModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="level-modal pop-in" style={{ maxWidth: 380, width: '100%', padding: 40, textAlign: 'center', position: 'relative' }}
        onClick={e => e.stopPropagation()}>
        <div className="rays">
          {Array.from({ length: RAY_COUNT }).map((_, i) => (
            <div
              key={i}
              className="ray"
              style={{
                transform: `rotate(${i * (360 / RAY_COUNT)}deg)`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p className="eyebrow" style={{ color: 'var(--gold)', marginBottom: 16 }}>Level Up!</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <Crest level={levelInfo.level} size={100} />
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 900, color: 'var(--gold-bright)', margin: '0 0 8px', letterSpacing: '0.06em' }}>
            {ROMAN[levelInfo.level - 1]}
          </h2>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink-soft)', margin: '0 0 24px', letterSpacing: '0.04em' }}>
            {levelInfo.label}
          </p>
          <p style={{ color: 'var(--ink-faint)', fontSize: 13, margin: '0 0 28px' }}>
            You have ascended to level {levelInfo.level}. Keep forging your path.
          </p>
          <button className="levelup-btn" onClick={onClose}>
            Continue Quest
          </button>
        </div>
      </div>
    </div>
  );
}
