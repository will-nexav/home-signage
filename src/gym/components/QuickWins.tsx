import { SKILLS, skillLevel, skillDef, INTENSITY_XP, SHOWUP_XP, CONSTITUTION } from '../skills';

interface Props {
  skillXp: Record<string, number>;
  onTrain: () => void;
}

interface Win {
  id: string;
  nextLevel: number;
  toNext: number;
  sessions: number;
  pct: number;
}

// Fastest XP/session for a skill: showing up for Constitution, a Beast set otherwise.
function fastRate(id: string): number {
  return id === CONSTITUTION ? SHOWUP_XP : INTENSITY_XP.beast;
}

export default function QuickWins({ skillXp, onTrain }: Props) {
  const wins: Win[] = SKILLS
    .map(s => {
      const lv = skillLevel(skillXp[s.id] || 0);
      return { id: s.id, nextLevel: lv.level + 1, toNext: lv.toNext, sessions: Math.max(1, Math.ceil(lv.toNext / fastRate(s.id))), pct: lv.pct, maxed: lv.maxed };
    })
    .filter(w => !w.maxed)
    .sort((a, b) => a.sessions - b.sessions || a.toNext - b.toNext)
    .slice(0, 3);

  if (wins.length === 0) return null;

  return (
    <div style={{
      border: '1px solid rgba(130,201,122,0.25)', borderRadius: 14, padding: 16, marginBottom: 24,
      background: 'radial-gradient(120% 120% at 0% 0%, rgba(130,201,122,0.07), #18120c 70%)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p className="eyebrow" style={{ color: '#a5e093' }}>⚡ Quick Wins</p>
        <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>closest level-ups</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {wins.map(w => {
          const def = skillDef(w.id);
          return (
            <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{def.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink)' }}>
                    {def.label} → <span style={{ color: 'var(--gold-bright)', fontWeight: 700 }}>Lv {w.nextLevel}</span>
                  </span>
                  <span className="mono" style={{ fontSize: 11, color: '#a5e093' }}>
                    ~{w.sessions} session{w.sessions === 1 ? '' : 's'}
                  </span>
                </div>
                <div style={{ height: 5, background: 'rgba(0,0,0,0.35)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${w.pct}%`, background: def.bar, borderRadius: 5 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={onTrain} className="ghost-btn" style={{ width: '100%', marginTop: 14, padding: '9px' }}>
        Bank a session →
      </button>
    </div>
  );
}
