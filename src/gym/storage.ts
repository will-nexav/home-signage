import type { GymState, LogEntry, Levels } from './types';
import {
  SKILLS, SKILL_ORDER, COMBAT_SKILLS, SUBS, ALL_IDS, skillDef,
  xpLevel, benchmarkProg, metricValue, statLabel, percentileLabel,
  clampLvl, epley, FEATS, PER_SESSION_XP, BODYWEIGHT_DEFAULT_LB, WEEKLY_CARDIO_GOAL,
} from './skills';
import { todayStr, weekStartStr, localDateStr } from '../core/engine';

export const GYM_KEY = 'ironlog_v3';

export function freshState(): GymState {
  return { log: [], unlockedFeats: [], bodyweightLb: BODYWEIGHT_DEFAULT_LB, weeklyGoal: WEEKLY_CARDIO_GOAL, created: todayStr() };
}

function seededState(): GymState {
  const s = freshState();
  const now = Date.now();
  s.log = [
    { id: 's-end', date: todayStr(), ts: now - 2000, activity: 'cardio', minutes: 18, note: 'baseline test w/ Mitch' },
    { id: 's-pull', date: todayStr(), ts: now - 1000, activity: 'pullups', reps: 2, note: 'baseline' },
  ];
  return s;
}

export function loadGym(): GymState {
  try {
    const raw = localStorage.getItem(GYM_KEY);
    if (!raw) return seededState();
    return { ...freshState(), ...(JSON.parse(raw) as GymState) };
  } catch { return seededState(); }
}
export function saveGym(s: GymState) {
  try { localStorage.setItem(GYM_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}
export function genId(): string { return `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`; }

// ── benchmark bests ──
export interface Best { value: number; entry: LogEntry; }
export function bestForSkill(state: GymState, id: string): Best | null {
  const act = skillDef(id).activity;
  if (!act) return null;
  const entries = state.log.filter(e => e.activity === act && hasMetric(id, e));
  if (entries.length === 0) return null;
  let best = entries[0], bestScore = metricValue(id, entries[0], state.bodyweightLb);
  for (const e of entries) {
    const sc = metricValue(id, e, state.bodyweightLb);
    if (sc > bestScore) { best = e; bestScore = sc; }
  }
  return { value: bestScore, entry: best };
}
function hasMetric(id: string, e: LogEntry): boolean {
  switch (id) {
    case 'constitution': return e.minutes != null;
    case 'biceps': case 'chest': return e.measure != null;
    case 'pullups': case 'pushups': case 'dips': return e.reps != null;
    case 'bench': case 'curl': return e.weight != null && e.reps != null;
    default: return false;
  }
}

// ── consistency / milestone xp ──
export function consistencyXp(state: GymState, id: string): number {
  const act = skillDef(id).activity;
  return act ? state.log.filter(e => e.activity === act).length * PER_SESSION_XP : 0;
}
export function magicXp(state: GymState): number {
  return FEATS.filter(f => state.unlockedFeats.includes(f.id)).reduce((sum, f) => sum + f.xp, 0);
}

// ── level for any skill id ──
export function levelOf(state: GymState, id: string): number {
  const def = SKILLS[id];
  if (!def) return 1;
  if (def.kind === 'aggregate') {
    const subs = SUBS[id].map(s => levelOf(state, s));
    return clampLvl(subs.reduce((a, b) => a + b, 0) / subs.length);
  }
  if (def.kind === 'consistency') return xpLevel(consistencyXp(state, id)).level;
  if (def.kind === 'milestone') return xpLevel(magicXp(state)).level;
  // benchmark
  const b = bestForSkill(state, id);
  return b ? benchmarkProg(id, b.entry, state.bodyweightLb).level : 1;
}

export function deriveLevels(state: GymState): Levels {
  const out: Levels = {};
  for (const id of ALL_IDS) out[id] = levelOf(state, id);
  return out;
}
export function totalLevel(levels: Levels): number {
  return SKILL_ORDER.reduce((sum, id) => sum + (levels[id] || 1), 0);
}
export function combatLevel(levels: Levels): number {
  return Math.round(COMBAT_SKILLS.reduce((sum, id) => sum + (levels[id] || 1), 0) / COMBAT_SKILLS.length);
}

// ── presentational view ──
export interface SkillView {
  id: string; level: number; pct: number; stat: string; caption: string;
  need: string; nextLevel: number; effort: number; untested: boolean;
}
export function skillView(state: GymState, id: string): SkillView {
  const def = SKILLS[id];
  const base = (o: Partial<SkillView>): SkillView => ({
    id, level: 1, pct: 0, stat: '', caption: '', need: '', nextLevel: 2, effort: Infinity, untested: false, ...o,
  });

  if (def.kind === 'aggregate') {
    const subs = SUBS[id].map(s => skillView(state, s));
    const tested = subs.filter(s => !s.untested);
    const pct = tested.length ? Math.round(tested.reduce((a, s) => a + s.pct, 0) / tested.length) : 0;
    return base({ level: levelOf(state, id), pct, stat: `avg of ${subs.length}`, caption: percentileLabel(levelOf(state, id)), untested: tested.length === 0 });
  }
  if (def.kind === 'consistency') {
    const xp = consistencyXp(state, id);
    const xl = xpLevel(xp);
    return base({
      level: xl.level, pct: xl.pct, stat: `${xp.toLocaleString()} xp`,
      caption: xl.maxed ? 'MAXED' : `Lv ${xl.level}`,
      need: xl.maxed ? 'MAXED' : `~${Math.max(1, Math.ceil(xl.toNext / PER_SESSION_XP))} sessions`,
      nextLevel: xl.level + 1, effort: xl.maxed ? Infinity : Math.ceil(xl.toNext / PER_SESSION_XP),
    });
  }
  if (def.kind === 'milestone') {
    const xp = magicXp(state);
    const xl = xpLevel(xp);
    const n = state.unlockedFeats.length;
    return base({
      level: xl.level, pct: xl.pct, stat: `${n}/${FEATS.length} tricks`,
      caption: `Lv ${xl.level}`, need: n < FEATS.length ? 'unlock a trick' : 'all unlocked', nextLevel: xl.level + 1,
    });
  }
  // benchmark
  const b = bestForSkill(state, id);
  if (!b) return base({ untested: true, stat: 'untested', caption: 'log to rank', need: 'log a set' });
  const p = benchmarkProg(id, b.entry, state.bodyweightLb);
  return base({ level: p.level, pct: p.pct, stat: statLabel(id, b.entry), caption: percentileLabel(p.level), need: p.need, nextLevel: p.nextLevel, effort: p.effort });
}

// ── weekly cardio + streaks ──
export function cardioDaysThisWeek(log: LogEntry[]): number {
  const ws = weekStartStr();
  return new Set(log.filter(e => e.activity === 'cardio' && e.date >= ws).map(e => e.date)).size;
}
export function weekStreak(log: LogEntry[], goal: number): number {
  const cardio = log.filter(e => e.activity === 'cardio');
  if (cardio.length === 0) return 0;
  const byWeek = new Map<string, Set<string>>();
  for (const e of cardio) {
    const ws = weekStartOf(e.date);
    if (!byWeek.has(ws)) byWeek.set(ws, new Set());
    byWeek.get(ws)!.add(e.date);
  }
  let streak = 0;
  const cursor = new Date(weekStartStr() + 'T00:00:00');
  for (let i = 0; i < 520; i++) {
    const days = byWeek.get(localDateStr(cursor))?.size || 0;
    if (days >= goal) streak++;
    else if (i !== 0) break;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}
function weekStartOf(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - d.getDay());
  return localDateStr(d);
}
export function dayStreak(log: LogEntry[]): number {
  const days = new Set(log.map(e => e.date));
  if (days.size === 0) return 0;
  let streak = 0;
  const cursor = new Date();
  if (!days.has(todayStr())) cursor.setDate(cursor.getDate() - 1);
  for (let i = 0; i < 1000; i++) {
    if (days.has(localDateStr(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
    else break;
  }
  return streak;
}

// ── benchmark chart series (native display units) ──
export function benchmarkSeries(state: GymState, id: string): number[] {
  const act = skillDef(id).activity;
  if (!act) return [];
  const entries = state.log.filter(e => e.activity === act && hasMetric(id, e)).sort((a, b) => a.ts - b.ts);
  return entries.map(e => {
    switch (id) {
      case 'constitution': return e.minutes || 0;
      case 'biceps': case 'chest': return e.measure || 0;
      case 'pullups': case 'pushups': case 'dips': return e.reps || 0;
      case 'bench': return Math.round(epley((e.weight || 0) * 2, e.reps || 0));
      case 'curl': return Math.round(epley(e.weight || 0, e.reps || 0));
      default: return 0;
    }
  });
}
export function cumulative(values: number[]): number[] {
  const out = [0];
  for (const v of values) out.push(out[out.length - 1] + v);
  return out;
}
