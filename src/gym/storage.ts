import type { GymState, GymSession, Intensity } from './types';
import { SKILLS, CONSTITUTION, SHOWUP_XP, INTENSITY_XP, skillLevel } from './skills';
import { todayStr, weekStartStr, localDateStr } from '../core/engine';

export const GYM_KEY = 'ironlog_v1';

export function freshState(): GymState {
  const skillXp: Record<string, number> = {};
  for (const s of SKILLS) skillXp[s.id] = 0;
  return { sessions: [], skillXp, weeklyGoal: 3, created: todayStr() };
}

export function loadGym(): GymState {
  try {
    const raw = localStorage.getItem(GYM_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as GymState;
    // ensure every skill has an xp entry (forward-compat)
    const skillXp = { ...parsed.skillXp };
    for (const s of SKILLS) if (typeof skillXp[s.id] !== 'number') skillXp[s.id] = 0;
    return { ...freshState(), ...parsed, skillXp };
  } catch {
    return freshState();
  }
}

export function saveGym(s: GymState) {
  try { localStorage.setItem(GYM_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// Compute the per-skill xp payout for a session.
export function sessionPayout(skills: string[], intensity: Intensity): Record<string, number> {
  const xp: Record<string, number> = { [CONSTITUTION]: SHOWUP_XP };
  for (const id of skills) {
    if (id === CONSTITUTION) continue;
    xp[id] = (xp[id] || 0) + INTENSITY_XP[intensity];
  }
  return xp;
}

export function totalLevel(skillXp: Record<string, number>): number {
  return SKILLS.reduce((sum, s) => sum + skillLevel(skillXp[s.id] || 0).level, 0);
}

export function totalXp(skillXp: Record<string, number>): number {
  return SKILLS.reduce((sum, s) => sum + (skillXp[s.id] || 0), 0);
}

// Sessions logged in the current (Sunday-start) week.
export function sessionsThisWeek(sessions: GymSession[]): GymSession[] {
  const ws = weekStartStr();
  return sessions.filter(x => x.date >= ws);
}

// Distinct training days this week (counts a day once even if multiple sessions).
export function daysThisWeek(sessions: GymSession[]): number {
  const ws = weekStartStr();
  const days = new Set(sessions.filter(x => x.date >= ws).map(x => x.date));
  return days.size;
}

// Consecutive prior weeks (not counting this one) that met the goal, plus this
// week if already met — the "week streak".
export function weekStreak(sessions: GymSession[], goal: number): number {
  if (sessions.length === 0) return 0;
  const byWeek = new Map<string, Set<string>>();
  for (const s of sessions) {
    const ws = weekStartOf(s.date);
    if (!byWeek.has(ws)) byWeek.set(ws, new Set());
    byWeek.get(ws)!.add(s.date);
  }
  let streak = 0;
  const cursor = new Date(weekStartStr() + 'T00:00:00');
  // Walk backwards week by week while the goal was met.
  for (let i = 0; i < 520; i++) {
    const ws = localDateStr(cursor);
    const days = byWeek.get(ws)?.size || 0;
    if (days >= goal) {
      streak++;
    } else if (i === 0) {
      // current week not yet complete — don't break the streak, just skip it
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

function weekStartOf(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - d.getDay());
  return localDateStr(d);
}

// Current streak of consecutive training days (today or yesterday anchored).
export function dayStreak(sessions: GymSession[]): number {
  const days = new Set(sessions.map(s => s.date));
  if (days.size === 0) return 0;
  let streak = 0;
  const cursor = new Date();
  // allow today to be missing without breaking (you might train later)
  if (!days.has(todayStr())) cursor.setDate(cursor.getDate() - 1);
  for (let i = 0; i < 1000; i++) {
    if (days.has(localDateStr(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  return streak;
}

export function genSessionId(): string {
  return `s-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Running total of a series, prefixed with a leading 0 (for chart baselines).
export function cumulative(values: number[]): number[] {
  const out = [0];
  for (const v of values) out.push(out[out.length - 1] + v);
  return out;
}
