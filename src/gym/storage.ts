import type { GymState, LogEntry, Levels, Activity } from './types';
import {
  CONS_XP, STRETCH_MOB_XP, xpLevel, enduranceLevel, pullupsLevel, benchLevel, curlLevel,
  enduranceProg, pullupsProg, benchProg, curlProg, percentileLabel,
  clampLvl, epley, BODYWEIGHT_DEFAULT_LB, WEEKLY_CARDIO_GOAL,
} from './skills';
import { todayStr, weekStartStr, localDateStr } from '../core/engine';

export const GYM_KEY = 'ironlog_v2';

export function freshState(): GymState {
  return { log: [], bodyweightLb: BODYWEIGHT_DEFAULT_LB, weeklyGoal: WEEKLY_CARDIO_GOAL, created: todayStr() };
}

export function loadGym(): GymState {
  try {
    const raw = localStorage.getItem(GYM_KEY);
    if (!raw) return seededState();
    const parsed = JSON.parse(raw) as GymState;
    return { ...freshState(), ...parsed };
  } catch {
    return seededState();
  }
}

export function saveGym(s: GymState) {
  try { localStorage.setItem(GYM_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// First-run seed with the numbers William gave: 18-min test, 2 pull-ups.
function seededState(): GymState {
  const s = freshState();
  const now = Date.now();
  s.log = [
    { id: 's-end', date: todayStr(), ts: now - 2000, activity: 'cardio', minutes: 18, note: 'baseline test w/ Mitch' },
    { id: 's-pull', date: todayStr(), ts: now - 1000, activity: 'pullups', reps: 2, note: 'baseline' },
  ];
  return s;
}

export function genId(): string {
  return `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// ── consistency XP (derived from the log) ──
export function constitutionXp(log: LogEntry[]): number {
  return log.reduce((sum, e) => sum + (CONS_XP[e.activity] || 0), 0);
}
export function mobilityXp(log: LogEntry[]): number {
  return log.filter(e => e.activity === 'stretch').length * STRETCH_MOB_XP;
}

// ── benchmark bests (ratchet to your best-ever) ──
export interface Best { value: number; entry: LogEntry; }

export function bestEndurance(log: LogEntry[]): Best | null {
  return pickBest(log.filter(e => e.activity === 'cardio' && e.minutes != null), e => e.minutes!);
}
export function bestPullups(log: LogEntry[]): Best | null {
  return pickBest(log.filter(e => e.activity === 'pullups' && e.reps != null), e => e.reps!);
}
export function bestBench(log: LogEntry[]): Best | null {
  return pickBest(log.filter(e => e.activity === 'bench' && e.weight != null && e.reps != null), e => epley(e.weight!, e.reps!));
}
export function bestCurl(log: LogEntry[]): Best | null {
  return pickBest(log.filter(e => e.activity === 'curl' && e.weight != null && e.reps != null), e => epley(e.weight!, e.reps!));
}
function pickBest(entries: LogEntry[], score: (e: LogEntry) => number): Best | null {
  if (entries.length === 0) return null;
  let best = entries[0], bestScore = score(entries[0]);
  for (const e of entries) { const sc = score(e); if (sc > bestScore) { best = e; bestScore = sc; } }
  return { value: bestScore, entry: best };
}

// ── all skill levels for a state ──
export function deriveLevels(state: GymState): Levels {
  const { log, bodyweightLb } = state;
  const constitution = xpLevel(constitutionXp(log)).level;
  const mobility = xpLevel(mobilityXp(log)).level;

  const be = bestEndurance(log);
  const bp = bestPullups(log);
  const bb = bestBench(log);
  const bc = bestCurl(log);

  const endurance = be ? enduranceLevel(be.entry.minutes!) : 1;
  const pullups = bp ? pullupsLevel(bp.entry.reps!) : 1;
  const bench = bb ? benchLevel(bb.entry.weight!, bb.entry.reps!, bodyweightLb) : 1;
  const curl = bc ? curlLevel(bc.entry.weight!, bc.entry.reps!) : 1;
  const strength = clampLvl((bench + curl + pullups) / 3);

  return { constitution, mobility, endurance, bench, curl, pullups, strength };
}

export function totalLevel(l: Levels): number {
  return l.constitution + l.strength + l.endurance + l.mobility;
}

// has this benchmark ever been logged?
export function hasData(state: GymState, id: string): boolean {
  switch (id) {
    case 'endurance': return !!bestEndurance(state.log);
    case 'pullups': return !!bestPullups(state.log);
    case 'bench': return !!bestBench(state.log);
    case 'curl': return !!bestCurl(state.log);
    default: return state.log.length > 0;
  }
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
    const ws = localDateStr(cursor);
    const days = byWeek.get(ws)?.size || 0;
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

// metric value over time for a benchmark skill's chart (native units)
export function benchmarkSeries(log: LogEntry[], activity: Activity): number[] {
  const entries = log.filter(e => e.activity === activity).sort((a, b) => a.ts - b.ts);
  return entries.map(e => {
    if (activity === 'cardio') return e.minutes || 0;
    if (activity === 'pullups') return e.reps || 0;
    if (activity === 'bench') return Math.round(epley((e.weight || 0) * 2, e.reps || 0)); // est total 1RM
    if (activity === 'curl') return Math.round(epley(e.weight || 0, e.reps || 0));        // est per-hand 1RM
    return 0;
  });
}

export function cumulative(values: number[]): number[] {
  const out = [0];
  for (const v of values) out.push(out[out.length - 1] + v);
  return out;
}

// ── presentational per-skill view (level, bar %, captions) ──
export interface SkillView {
  id: string;
  level: number;
  pct: number;
  stat: string;      // current value, e.g. "18 min", "2 reps", "35lb×8"
  caption: string;   // percentile / xp note
  need: string;      // what reaches the next level
  nextLevel: number;
  effort: number;    // for ranking quick wins (lower = closer); Infinity if n/a
  untested: boolean;
}

export function skillView(state: GymState, id: string, levels: Levels): SkillView {
  const { log, bodyweightLb } = state;
  const base = (o: Partial<SkillView>): SkillView => ({
    id, level: 1, pct: 0, stat: '', caption: '', need: '', nextLevel: 2, effort: Infinity, untested: false, ...o,
  });

  if (id === 'constitution' || id === 'mobility') {
    const xp = id === 'constitution' ? constitutionXp(log) : mobilityXp(log);
    const xl = xpLevel(xp);
    const perSession = id === 'constitution' ? 70 : STRETCH_MOB_XP;
    return base({
      level: xl.level, pct: xl.pct, stat: `${xp.toLocaleString()} xp`,
      caption: xl.maxed ? 'MAXED' : `${xl.toNext.toLocaleString()} xp to Lv ${xl.level + 1}`,
      need: xl.maxed ? 'MAXED' : `~${Math.max(1, Math.ceil(xl.toNext / perSession))} sessions`,
      nextLevel: xl.level + 1, effort: xl.maxed ? Infinity : Math.ceil(xl.toNext / perSession),
    });
  }

  if (id === 'strength') {
    const subs = ['bench', 'curl', 'pullups'].map(s => skillView(state, s, levels));
    const pct = Math.round(subs.reduce((a, s) => a + s.pct, 0) / subs.length);
    return base({ level: levels.strength, pct, stat: 'avg of 3 lifts', caption: percentileLabel(levels.strength), nextLevel: levels.strength + 1 });
  }

  // benchmark skills
  if (id === 'endurance') {
    const b = bestEndurance(log);
    if (!b) return base({ untested: true, stat: 'untested', caption: 'log a treadmill test', need: 'log a test' });
    const p = enduranceProg(b.entry.minutes!);
    return base({ level: p.level, pct: p.pct, stat: `${b.entry.minutes} min`, caption: percentileLabel(p.level), need: p.need, nextLevel: p.nextLevel, effort: p.effort });
  }
  if (id === 'pullups') {
    const b = bestPullups(log);
    if (!b) return base({ untested: true, stat: 'untested', caption: 'log a set', need: 'log a set' });
    const p = pullupsProg(b.entry.reps!);
    return base({ level: p.level, pct: p.pct, stat: `${b.entry.reps} reps`, caption: percentileLabel(p.level), need: p.need, nextLevel: p.nextLevel, effort: p.effort });
  }
  if (id === 'bench') {
    const b = bestBench(log);
    if (!b) return base({ untested: true, stat: 'untested', caption: 'log a set', need: 'log a set' });
    const p = benchProg(b.entry.weight!, b.entry.reps!, bodyweightLb);
    return base({ level: p.level, pct: p.pct, stat: `${b.entry.weight}lb×${b.entry.reps}`, caption: percentileLabel(p.level), need: p.need, nextLevel: p.nextLevel, effort: p.effort });
  }
  // curl
  const b = bestCurl(log);
  if (!b) return base({ untested: true, stat: 'untested', caption: 'log a set', need: 'log a set' });
  const p = curlProg(b.entry.weight!, b.entry.reps!);
  return base({ level: p.level, pct: p.pct, stat: `${b.entry.weight}lb×${b.entry.reps}`, caption: percentileLabel(p.level), need: p.need, nextLevel: p.nextLevel, effort: p.effort });
}
