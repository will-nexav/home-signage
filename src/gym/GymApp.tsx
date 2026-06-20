import { useState, useEffect } from 'react';
import type { GymState, Levels, Activity, LogEntry } from './types';
import {
  loadGym, saveGym, freshState, genId, deriveLevels, totalLevel,
  cardioDaysThisWeek, weekStreak, dayStreak, skillView,
} from './storage';
import { HEADLINE, STRENGTH_SUBS, CONS_XP, STRETCH_MOB_XP } from './skills';
import { todayStr } from '../core/engine';
import { SFX, QuestFX } from '../core/sfx';
import Ring from '../components/Ring';
import XpDropStack from '../components/XpDropStack';
import SkillBar from './components/SkillBar';
import LogSheet, { type LogInput } from './components/LogSheet';
import SessionLog from './components/SessionLog';
import SkillLevelUpModal from './components/SkillLevelUpModal';
import SkillDetail from './components/SkillDetail';
import QuickWins from './components/QuickWins';

interface PendingLU { skillId: string; level: number; }
const DING_IDS: (keyof Levels)[] = ['constitution', 'mobility', 'endurance', 'bench', 'curl', 'pullups'];
const ACT_SKILL: Record<Activity, string> = { cardio: 'endurance', bench: 'bench', curl: 'curl', pullups: 'pullups', stretch: 'mobility' };

export default function GymApp() {
  const [state, setState] = useState<GymState>(() => loadGym());
  const [sheet, setSheet] = useState(false);
  const [sheetInit, setSheetInit] = useState<Activity | undefined>(undefined);
  const [luQueue, setLuQueue] = useState<PendingLU[]>([]);
  const [flash, setFlash] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => { saveGym(state); }, [state]);

  const levels = deriveLevels(state);
  const tLevel = totalLevel(levels);
  const days = cardioDaysThisWeek(state.log);
  const goal = state.weeklyGoal;
  const goalPct = Math.min(100, Math.round((days / goal) * 100));
  const goalMet = days >= goal;
  const wStreak = weekStreak(state.log, goal);
  const dStreak = dayStreak(state.log);

  function openSheet(init?: Activity) { setSheetInit(init); setSheet(true); }

  function confirm(input: LogInput) {
    setSheet(false);
    const entry: LogEntry = { id: genId(), date: todayStr(), ts: Date.now(), ...input };
    const before = deriveLevels(state);
    const next = { ...state, log: [...state.log, entry] };
    const after = deriveLevels(next);
    setState(next);

    // xp drops
    SFX.complete();
    QuestFX.emit('Constitution', CONS_XP[input.activity] || 0);
    if (input.activity === 'stretch') setTimeout(() => QuestFX.emit('Mobility', STRETCH_MOB_XP), 140);

    // flash the trained skill + constitution
    const primary = ACT_SKILL[input.activity];
    setFlash([primary, 'constitution', primary === 'bench' || primary === 'curl' || primary === 'pullups' ? 'strength' : '']);
    setTimeout(() => setFlash([]), 1400);

    // level-up fanfares (ratchet — only fires on a true new best)
    const dings: PendingLU[] = [];
    for (const id of DING_IDS) if (after[id] > before[id]) dings.push({ skillId: id, level: after[id] });
    if (dings.length) setTimeout(() => { SFX.levelUp(); setLuQueue(dings); }, 450);
  }

  function closeLevelUp() {
    setLuQueue(q => {
      const rest = q.slice(1);
      if (rest.length) setTimeout(() => SFX.levelUp(), 60);
      return rest;
    });
  }

  function reset() {
    if (!window.confirm('Reset all Iron Log progress? This cannot be undone.')) return;
    setState(freshState());
    setSelected(null);
  }

  if (selected) {
    return (
      <>
        <SkillDetail state={state} id={selected} levels={levels}
          onBack={() => setSelected(null)} onOpen={setSelected} onLog={openSheet} />
        {sheet && <LogSheet initial={sheetInit} onConfirm={confirm} onCancel={() => setSheet(false)} />}
        {luQueue.length > 0 && <SkillLevelUpModal skillId={luQueue[0].skillId} level={luQueue[0].level} onClose={closeLevelUp} />}
        <XpDropStack />
      </>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 18px 60px' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--gold)' }}>The Grind</p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 900, color: 'var(--gold-bright)', margin: '2px 0 0', letterSpacing: '0.08em' }}>IRON LOG</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 30, fontWeight: 700, color: 'var(--gold-bright)', lineHeight: 1 }}>{tLevel}</div>
          <p className="eyebrow" style={{ marginTop: 4 }}>Total Level · /396</p>
        </div>
      </div>

      {/* hero: weekly cardio ring + log button */}
      <div style={{
        border: '1px solid rgba(201,168,107,0.22)', borderRadius: 16, padding: 22, marginBottom: 24,
        background: 'radial-gradient(120% 120% at 80% -20%, rgba(236,212,155,0.07), #18120c 70%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Ring pct={goalPct} size={92} stroke={7} color={goalMet ? '#82c97a' : '#c9a86b'}>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: goalMet ? '#a5e093' : 'var(--gold-bright)', lineHeight: 1 }}>
                {days}<span style={{ fontSize: 14, color: 'var(--ink-faint)' }}>/{goal}</span>
              </div>
              <div className="eyebrow" style={{ fontSize: 8, marginTop: 2 }}>cardio/wk</div>
            </div>
          </Ring>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)', margin: '0 0 8px', lineHeight: 1.3 }}>
              {goalMet ? '🔥 3× cardio cleared this week.' : `${goal - days} more cardio session${goal - days === 1 ? '' : 's'} this week.`}
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <Stat label="Week streak" value={`${wStreak}w`} />
              <Stat label="Day streak" value={`${dStreak}d`} />
            </div>
          </div>
        </div>
        <button onClick={() => openSheet()} style={{
          width: '100%', marginTop: 20, padding: 16, borderRadius: 12, cursor: 'pointer',
          border: '1px solid rgba(236,212,155,0.5)', background: 'linear-gradient(180deg, rgba(236,212,155,0.18), rgba(236,212,155,0.08))',
          color: 'var(--gold-bright)', fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 800, letterSpacing: '0.1em',
          boxShadow: '0 0 30px -8px rgba(236,212,155,0.5)', textTransform: 'uppercase',
        }}>⚔️ Log a Session</button>
      </div>

      <QuickWins state={state} levels={levels} onTrain={() => openSheet()} />

      {/* skills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 11 }}>
        <p className="eyebrow">Skills</p>
        <span style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>tap for chart & history →</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 28 }}>
        {HEADLINE.map(id => (
          <div key={id}>
            <SkillBar view={skillView(state, id, levels)} highlight={flash.includes(id)} onClick={() => setSelected(id)} />
            {id === 'strength' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '6px 0 0 16px', paddingLeft: 10, borderLeft: '1px solid rgba(201,168,107,0.15)' }}>
                {STRENGTH_SUBS.map(s => (
                  <SkillBar key={s} compact view={skillView(state, s, levels)} highlight={flash.includes(s)} onClick={() => setSelected(s)} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="eyebrow" style={{ marginBottom: 7 }}>Training Log</p>
      <SessionLog log={state.log} />

      <div style={{ textAlign: 'center', marginTop: 36 }}>
        <button className="reset-link" onClick={reset}>reset all data</button>
      </div>

      {sheet && <LogSheet initial={sheetInit} onConfirm={confirm} onCancel={() => setSheet(false)} />}
      {luQueue.length > 0 && <SkillLevelUpModal skillId={luQueue[0].skillId} level={luQueue[0].level} onClose={closeLevelUp} />}
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
