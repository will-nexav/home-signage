import { useEffect, useRef, useState } from 'react';
import type { AppState, Category, Habit, LevelInfo, NWState, HealthState, BizState, ChecklistState, WeeklyState, DailyTask } from './types';
import { LEVELS, HABITS_SEED, SEED, KEY, CHECKLIST_KEY, WEEKLY_KEY, NW_KEY, HEALTH_KEY, BIZ_KEY, DAILY_TASKS_SEED, WEEKLY_TASKS_SEED } from './constants';

export function getLevel(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

export function computeXp(cats: Category[]): number {
  let total = 0;
  for (const cat of cats) {
    for (const grp of cat.groups) {
      for (const task of grp.tasks) {
        if (task.done) total += task.xp;
      }
    }
  }
  return total;
}

export function catStats(cat: Category) {
  let done = 0, total = 0, xpEarned = 0, xpTotal = 0;
  for (const grp of cat.groups) {
    for (const task of grp.tasks) {
      total++;
      xpTotal += task.xp;
      if (task.done) { done++; xpEarned += task.xp; }
    }
  }
  return { done, total, xpEarned, xpTotal, pct: total ? Math.round(done / total * 100) : 0 };
}

export function grpStats(grp: Category['groups'][number]) {
  let done = 0, xpEarned = 0, xpTotal = 0;
  const total = grp.tasks.length;
  for (const task of grp.tasks) {
    xpTotal += task.xp;
    if (task.done) { done++; xpEarned += task.xp; }
  }
  return { done, total, xpEarned, xpTotal, pct: total ? Math.round(done / total * 100) : 0 };
}

export function overallStats(cats: Category[]) {
  let done = 0, total = 0, xpEarned = 0, xpTotal = 0;
  for (const cat of cats) {
    const s = catStats(cat);
    done += s.done; total += s.total;
    xpEarned += s.xpEarned; xpTotal += s.xpTotal;
  }
  return { done, total, xpEarned, xpTotal, pct: total ? Math.round(done / total * 100) : 0 };
}

export function habitStats(habits: Habit[], days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  const cutoffStr = localDateStr(cutoff);
  const result: Record<string, number> = {};
  for (const h of habits) {
    result[h.id] = h.days.filter(d => d >= cutoffStr).length;
  }
  return result;
}

export function compositeScore(cats: Category[], habits: Habit[]): number {
  const overall = overallStats(cats);
  const questPct = overall.pct;
  const habDays = habitStats(habits, 7);
  const totalHabDays = Object.values(habDays).reduce((a, b) => a + b, 0);
  const maxHabDays = habits.length * 7;
  const habPct = maxHabDays ? Math.round(totalHabDays / maxHabDays * 100) : 0;
  return Math.round(questPct * 0.6 + habPct * 0.4);
}

export function pendingRewards(xp: number): number {
  return Math.floor(xp / 100);
}

export function applyRollover(state: ChecklistState, today: string): ChecklistState {
  if (state.date === today) return state;
  const rolledDaily: DailyTask[] = state.daily
    .filter(t => !t.done)
    .map(t => ({ ...t, rolledFrom: state.date, tag: 'rolled' }));
  // Get fresh tasks for today's sequence phase
  const seqIdx = state.sequence;
  return {
    ...state,
    date: today,
    daily: rolledDaily,
    sequence: seqIdx,
  };
}

export function rolledLabel(d: DailyTask): string {
  if (!d.rolledFrom) return d.label;
  return `${d.label}`;
}

export function calcNoGamingStreak(habits: Habit[]): number {
  const h = habits.find(h => h.id === 'h-nogame');
  if (!h) return 0;
  let streak = 0;
  const today = todayStr();
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = localDateStr(d);
    if (ds === today || h.days.includes(ds)) {
      if (ds === today && !h.days.includes(ds)) {
        // today not yet logged, just count past
      } else {
        streak++;
      }
    } else {
      break;
    }
  }
  return streak;
}

export function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function todayStr(): string {
  return localDateStr(new Date());
}

export function weekStartStr(): string {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return localDateStr(d);
}

export function daysBetween(a: string, b: string): number {
  return Math.abs((new Date(a).getTime() - new Date(b).getTime()) / 86400000);
}

export function seedToState(): AppState {
  const habits: Habit[] = HABITS_SEED.map(h => ({ ...h, days: [] }));
  const cats: Category[] = SEED.cats.map(c => ({
    ...c,
    groups: c.groups.map(g => ({
      ...g,
      tasks: g.tasks.map(t => ({ ...t })),
    })),
  }));
  const xp = computeXp(cats);
  const lvl = getLevel(xp);
  return { cats, habits, xp, level: lvl.level, date: todayStr(), weekStart: weekStartStr() };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedToState();
    return JSON.parse(raw) as AppState;
  } catch {
    return seedToState();
  }
}

export function saveState(s: AppState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
}

// Dashboard seeds
export const NW_SEED: NWState = {
  snapshots: [
    {
      ym: '2025-01',
      assets: [
        { id: 'a1', label: 'Checking account',  value: 3200  },
        { id: 'a2', label: 'Savings account',   value: 1500  },
        { id: 'a3', label: 'Investment account', value: 4800 },
        { id: 'a4', label: 'NEXAV equity (est)', value: 5000 },
      ],
      liabilities: [
        { id: 'l1', label: 'Credit card',       value: 1200  },
        { id: 'l2', label: 'Student loan',      value: 8400  },
      ],
    },
  ],
};

export const HEALTH_SEED: HealthState = {
  weight: 0,
  weightTarget: 0,
  vo2max: 0,
  vo2maxTarget: 0,
  sleep: 0,
  sleepTarget: 0,
  strength: 0,
  strengthTarget: 0,
  history: [],
};

export const BIZ_SEED: BizState = {
  companies: [
    {
      id: 'nexav',
      name: 'NEXAV',
      role: 'Founder & CEO',
      revenue: 0,
      target: 100000,
      deals: 0,
      dealTarget: 10,
      note: 'AI-powered sales & automation agency',
    },
  ],
};

// Money formatter
export function money(v: number): string {
  if (Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${v.toLocaleString()}`;
}

export function monthLabel(ym: string): string {
  const [y, m] = ym.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m) - 1]} ${y}`;
}

export function currentYM(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Checklist helpers
export function loadChecklist(): ChecklistState {
  const today = todayStr();
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    if (!raw) return freshChecklist(today);
    const parsed = JSON.parse(raw) as ChecklistState;
    if (parsed.date !== today) return applyRollover(parsed, today);
    return parsed;
  } catch {
    return freshChecklist(today);
  }
}

function freshChecklist(today: string): ChecklistState {
  const seqIdx = 0;
  const seqKey = DAILY_TASKS_SEED;
  const tasks: DailyTask[] = [];
  for (const [, items] of Object.entries(seqKey)) {
    for (const t of items) {
      tasks.push({ ...t, done: false });
    }
  }
  return { date: today, daily: tasks, sequence: seqIdx };
}

export function saveChecklist(s: ChecklistState) {
  try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

export function loadWeekly(): WeeklyState {
  const ws = weekStartStr();
  try {
    const raw = localStorage.getItem(WEEKLY_KEY);
    if (!raw) return freshWeekly(ws);
    const parsed = JSON.parse(raw) as WeeklyState;
    if (parsed.weekStart !== ws) return freshWeekly(ws);
    return parsed;
  } catch {
    return freshWeekly(ws);
  }
}

function freshWeekly(ws: string): WeeklyState {
  return {
    weekStart: ws,
    weekly: WEEKLY_TASKS_SEED.map(t => ({ ...t, done: false })),
  };
}

export function saveWeekly(s: WeeklyState) {
  try { localStorage.setItem(WEEKLY_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// React hooks
export function useCountTo(target: number, duration = 800) {
  const [val, setVal] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = ref.current;
    const diff = target - start;
    const startTime = performance.now();
    let raf: number;
    function step(now: number) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const cur = Math.round(start + diff * eased);
      setVal(cur);
      if (t < 1) raf = requestAnimationFrame(step);
      else ref.current = target;
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export function useGrow(target: number, duration = 600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const startTime = performance.now();
    let raf: number;
    function step(now: number) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(target * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export { NW_KEY, HEALTH_KEY, BIZ_KEY };
