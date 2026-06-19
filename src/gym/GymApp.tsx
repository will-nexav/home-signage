import { useState, useEffect } from 'react';
import type { GymState, Intensity } from './types';
import {
  loadGym, saveGym, freshState, sessionPayout, totalLevel, totalXp,
  daysThisWeek, weekStreak, dayStreak, genSessionId,
} from './storage';
import { SKILLS, skillLevel, skillDef } from './skills';
import { todayStr } from '../core/engine';
import { SFX, QuestFX } from '../core/sfx';
import Ring from '../components/Ring';
import XpDropStack from '../components/XpDropStack';
import SkillBar from './components/SkillBar';
import LogSheet from './components/LogSheet';
import SessionLog from './components/SessionLog';
import SkillLevelUpModal from './components/SkillLevelUpModal';

interface PendingLU { skillId: string; level: number; }

export default function GymApp() {
  const [state, setState] = useState<GymState>(() => loadGym());
  const [sheet, setSheet] = useState(false);
  const [luQueue, setLuQueue] = useState<PendingLU[]>([]);
  const [flash, setFlash] = useState<string[]>([]);

  useEffect(() => { saveGym(state); }, [state]);

  const tLevel = totalLevel(state.skillXp);
  const tXp = totalXp(state.skillXp);
  const days = daysThisWeek(state.sessions);
  const goal = state.weeklyGoal;
  const goalPct = Math.min(100, Math.round((days / goal) * 100));
  const wStreak = weekStreak(state.sessions, goal);
  const dStreak = dayStreak(state.sessions);
  const goalMet = days >= goal;

  function confirm(skills: string[], intensity: Intensity, note: string) {
    setSheet(false);
    const payout = sessionPayout(skills, intensity);

    // detect level-ups against current xp
    const levelUps: PendingLU[] = [];
    const newSkillXp = { ...state.skillXp };
    for (const [id, gain] of Object.entries(payout)) {
      const before = newSkillXp[id] || 0;
      const after = before + gain;
      newSkillXp[id] = after;
      const oldL = skillLevel(before).level;
      const newL = skillLevel(after).level;
      if (newL > oldL) levelUps.push({ skillId: id, level: newL });
    }

    setState(prev => ({
      ...prev,
      skillXp: newSkillXp,
      sessions: [
        ...prev.sessions,
        { id: genSessionId(), date: todayStr(), ts: Date.now(), skills: skills.filter(s => s !== 'constitution'), intensity, note: note || undefined, xp: payout },
      ],
    }));

    // xp drops, staggered for that satisfying cascade
    SFX.complete();
    const ids = Object.keys(payout);
    ids.forEach((id, i) => {
      setTimeout(() => QuestFX.emit(skillDef(id).label, payout[id]), i * 140);
    });

    // highlight the trained bars
    setFlash(ids);
    setTimeout(() => setFlash([]), 1400);

    // queue level-up fanfares after the drops settle
    if (levelUps.length) {
      setTimeout(() => {
        SFX.levelUp();
        setLuQueue(levelUps);
      }, ids.length * 140 + 200);
    }
  }

  function closeLevelUp() {
    setLuQueue(q => {
      const next = q.slice(1);
      if (next.length) setTimeout(() => SFX.levelUp(), 60);
      return next;
    });
  }

  function reset() {
    if (!window.confirm('Reset all Iron Log progress? This cannot be undone.')) return;
    setState(freshState());
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 18px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--gold)' }}>The Grind</p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 900, color: 'var(--gold-bright)', margin: '2px 0 0', letterSpacing: '0.08em' }}>
            IRON LOG
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 30, fontWeight: 700, color: 'var(--gold-bright)', lineHeight: 1 }}>{tLevel}</div>
          <p className="eyebrow" style={{ marginTop: 4 }}>Total Level · {Math.round(tXp).toLocaleString()} xp</p>
        </div>
      </div>

      {/* Hero: weekly goal + train button */}
      <div style={{
        border: '1px solid rgba(201,168,107,0.22)', borderRadius: 16, padding: 22, marginBottom: 24,
        background: 'radial-gradient(120% 120% at 80% -20%, rgba(236,212,155,0.07), #18120c 70%)',
        boxShadow: 'inset 0 1px 0 rgba(236,212,155,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Ring pct={goalPct} size={92} stroke={7} color={goalMet ? '#82c97a' : '#c9a86b'}>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: goalMet ? '#a5e093' : 'var(--gold-bright)', lineHeight: 1 }}>
                {days}<span style={{ fontSize: 14, color: 'var(--ink-faint)' }}>/{goal}</span>
              </div>
              <div className="eyebrow" style={{ fontSize: 8, marginTop: 2 }}>this week</div>
            </div>
          </Ring>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)', margin: '0 0 8px', lineHeight: 1.3 }}>
              {goalMet
                ? '🔥 Weekly goal cleared. Every extra session is pure XP.'
                : `${goal - days} more session${goal - days === 1 ? '' : 's'} to clear this week.`}
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <Stat label="Week streak" value={`${wStreak}w`} />
              <Stat label="Day streak" value={`${dStreak}d`} />
            </div>
          </div>
        </div>

        <button onClick={() => setSheet(true)} style={{
          width: '100%', marginTop: 20, padding: '16px', borderRadius: 12, cursor: 'pointer',
          border: '1px solid rgba(236,212,155,0.5)', background: 'linear-gradient(180deg, rgba(236,212,155,0.18), rgba(236,212,155,0.08))',
          color: 'var(--gold-bright)', fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 800, letterSpacing: '0.1em',
          boxShadow: '0 0 30px -8px rgba(236,212,155,0.5)', textTransform: 'uppercase',
        }}>
          ⚔️ Train — Log a Session
        </button>
      </div>

      {/* Skills */}
      <p className="eyebrow" style={{ marginBottom: 11 }}>Skills</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 28 }}>
        {SKILLS.map(s => (
          <SkillBar key={s.id} id={s.id} xp={state.skillXp[s.id] || 0} highlight={flash.includes(s.id)} />
        ))}
      </div>

      {/* History */}
      <p className="eyebrow" style={{ marginBottom: 7 }}>Training Log</p>
      <SessionLog sessions={state.sessions} />

      <div style={{ textAlign: 'center', marginTop: 36 }}>
        <button className="reset-link" onClick={reset}>reset all data</button>
      </div>

      {sheet && <LogSheet onConfirm={confirm} onCancel={() => setSheet(false)} />}
      {luQueue.length > 0 && (
        <SkillLevelUpModal skillId={luQueue[0].skillId} level={luQueue[0].level} onClose={closeLevelUp} />
      )}
      <XpDropStack />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: 'var(--gold-bright)', lineHeight: 1 }}>{value}</div>
      <p className="eyebrow" style={{ fontSize: 8, marginTop: 3 }}>{label}</p>
    </div>
  );
}
