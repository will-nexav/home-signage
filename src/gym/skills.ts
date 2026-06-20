import type { Activity } from './types';

export interface SkillDef {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  bar: string;   // gradient for the level bar
  color: string; // solid accent (charts, glow)
  glow: string;
  kind: 'consistency' | 'benchmark' | 'aggregate';
  unit?: string; // benchmark display unit
}

export const SKILLS: Record<string, SkillDef> = {
  constitution: { id: 'constitution', label: 'Constitution', icon: '❤️', blurb: 'Showing up. Every session feeds it.', bar: 'linear-gradient(90deg,#9c7c3e,#ecd49b)', color: '#ecd49b', glow: 'rgba(236,212,155,0.45)', kind: 'consistency' },
  strength:     { id: 'strength',     label: 'Strength',     icon: '⚔️', blurb: 'Average of Bench, Curl & Pull-ups.',     bar: 'linear-gradient(90deg,#b3402f,#f5765a)', color: '#f5765a', glow: 'rgba(245,118,90,0.45)', kind: 'aggregate' },
  bench:        { id: 'bench',        label: 'Bench',        icon: '🏋️', blurb: 'Dumbbell bench press (per hand).',       bar: 'linear-gradient(90deg,#b3402f,#f5765a)', color: '#f5765a', glow: 'rgba(245,118,90,0.45)', kind: 'benchmark', unit: 'lb' },
  curl:         { id: 'curl',         label: 'Curl',         icon: '💪', blurb: 'Dumbbell curl (per hand).',             bar: 'linear-gradient(90deg,#c2682f,#f0a35a)', color: '#f0a35a', glow: 'rgba(240,163,90,0.45)', kind: 'benchmark', unit: 'lb' },
  pullups:      { id: 'pullups',      label: 'Pull-ups',     icon: '🧗', blurb: 'Max consecutive strict pull-ups.',     bar: 'linear-gradient(90deg,#8a5cc2,#c4a3f5)', color: '#c4a3f5', glow: 'rgba(196,163,245,0.45)', kind: 'benchmark', unit: 'reps' },
  endurance:    { id: 'endurance',    label: 'Endurance',    icon: '🏃', blurb: "Mitch's treadmill test.",               bar: 'linear-gradient(90deg,#3f8f4f,#82c97a)', color: '#82c97a', glow: 'rgba(130,201,122,0.45)', kind: 'benchmark', unit: 'min' },
  mobility:     { id: 'mobility',     label: 'Mobility',     icon: '🧘', blurb: 'Stretch & movement for back + hand.',   bar: 'linear-gradient(90deg,#3f6fd8,#7c9ef5)', color: '#7c9ef5', glow: 'rgba(124,158,245,0.45)', kind: 'consistency' },
};

// Top-level skills shown on the home screen (Strength expands into its subs).
export const HEADLINE = ['constitution', 'strength', 'endurance', 'mobility'];
export const STRENGTH_SUBS = ['bench', 'curl', 'pullups'];

export function skillDef(id: string): SkillDef {
  return SKILLS[id] || SKILLS.constitution;
}

export const BODYWEIGHT_DEFAULT_LB = 190; // ≈ 86.4 kg
export const WEEKLY_CARDIO_GOAL = 3;

// XP awarded to Constitution by activity (the consistency grind).
export const CONS_XP: Record<Activity, number> = { cardio: 75, bench: 60, curl: 60, pullups: 60, stretch: 50 };
export const STRETCH_MOB_XP = 100; // Mobility xp per stretch session

// ── consistency leveling: the RuneScape XP curve (level 1..99) ──
export const MAX_LEVEL = 99;
const XP_TABLE: number[] = (() => {
  const table = [0, 0];
  let points = 0;
  for (let lvl = 1; lvl < MAX_LEVEL; lvl++) {
    points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
    table[lvl + 1] = Math.floor(points / 4);
  }
  return table;
})();
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level >= MAX_LEVEL) return XP_TABLE[MAX_LEVEL];
  return XP_TABLE[level];
}
export function levelFromXp(xp: number): number {
  for (let lvl = MAX_LEVEL; lvl >= 1; lvl--) if (xp >= XP_TABLE[lvl]) return lvl;
  return 1;
}
export interface XpLevel { level: number; pct: number; toNext: number; maxed: boolean; }
export function xpLevel(xp: number): XpLevel {
  const level = levelFromXp(xp);
  if (level >= MAX_LEVEL) return { level: MAX_LEVEL, pct: 100, toNext: 0, maxed: true };
  const base = xpForLevel(level), next = xpForLevel(level + 1);
  return { level, pct: Math.round(((xp - base) / (next - base)) * 100), toNext: next - xp, maxed: false };
}

// ── benchmark leveling: level = percentile, via piecewise-linear anchors ──
type Anchor = [value: number, level: number];

// Mitch's treadmill test (minutes). 22=Lv60, 25=Lv90 are your anchors.
const END_ANCHORS: Anchor[]  = [[14, 1], [18, 20], [21, 50], [22, 60], [23.5, 78], [25, 90], [26, 99]];
// Max consecutive pull-ups, 28yo male.
const PULL_ANCHORS: Anchor[] = [[0, 3], [1, 15], [2, 25], [3, 33], [5, 50], [8, 70], [10, 80], [12, 85], [15, 90], [20, 96], [25, 99]];
// Bench: estimated 1RM (total) as a multiple of bodyweight.
const BENCH_RATIO_ANCHORS: Anchor[] = [[0.25, 5], [0.5, 20], [0.75, 35], [1.0, 50], [1.25, 65], [1.5, 80], [1.75, 90], [2.0, 97], [2.25, 99]];
// Curl: estimated 1RM per hand (lb).
const CURL_1RM_ANCHORS: Anchor[] = [[8, 5], [15, 30], [25, 50], [35, 70], [45, 85], [55, 95], [65, 99]];

function interp(anchors: Anchor[], v: number): number {
  if (v <= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (v >= last[0]) return last[1];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [v0, l0] = anchors[i], [v1, l1] = anchors[i + 1];
    if (v >= v0 && v <= v1) return l0 + (l1 - l0) * ((v - v0) / (v1 - v0));
  }
  return 1;
}
// Inverse: smallest value that reaches a given level (for "what you need").
function invInterp(anchors: Anchor[], lvl: number): number {
  if (lvl <= anchors[0][1]) return anchors[0][0];
  const last = anchors[anchors.length - 1];
  if (lvl >= last[1]) return last[0];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [v0, l0] = anchors[i], [v1, l1] = anchors[i + 1];
    if (lvl >= l0 && lvl <= l1) return v0 + (v1 - v0) * ((lvl - l0) / (l1 - l0));
  }
  return last[0];
}
export const clampLvl = (l: number) => Math.max(1, Math.min(MAX_LEVEL, Math.round(l)));
export const epley = (w: number, reps: number) => w * (1 + reps / 30); // estimated 1RM

export function enduranceLevel(minutes: number) { return clampLvl(interp(END_ANCHORS, minutes)); }
export function pullupsLevel(reps: number) { return clampLvl(interp(PULL_ANCHORS, reps)); }
export function benchLevel(perHandLb: number, reps: number, bwLb: number) {
  return clampLvl(interp(BENCH_RATIO_ANCHORS, epley(perHandLb * 2, reps) / bwLb));
}
export function curlLevel(perHandLb: number, reps: number) {
  return clampLvl(interp(CURL_1RM_ANCHORS, epley(perHandLb, reps)));
}

// Full progress for a benchmark: current level, bar %, next-level requirement.
export interface BProg { level: number; pct: number; nextLevel: number; need: string; effort: number; maxed: boolean; }

function progFromValue(anchors: Anchor[], value: number, fmtNeed: (target: number) => string, effortOf: (delta: number) => number): BProg {
  const level = clampLvl(interp(anchors, value));
  if (level >= MAX_LEVEL) return { level, pct: 100, nextLevel: level, need: 'MAXED', effort: Infinity, maxed: true };
  const lowV = invInterp(anchors, level);
  const highV = invInterp(anchors, level + 1);
  const pct = Math.max(0, Math.min(100, Math.round(((value - lowV) / (highV - lowV)) * 100)));
  return { level, pct, nextLevel: level + 1, need: fmtNeed(highV), effort: effortOf(highV - value), maxed: false };
}

export function enduranceProg(minutes: number): BProg {
  return progFromValue(END_ANCHORS, minutes, t => `${(t - minutes).toFixed(1)} more min`, d => d * 8);
}
export function pullupsProg(reps: number): BProg {
  return progFromValue(PULL_ANCHORS, reps, t => {
    const n = Math.max(1, Math.ceil(t - reps));
    return `${n} more rep${n === 1 ? '' : 's'}`;
  }, d => Math.ceil(d));
}
export function benchProg(perHandLb: number, reps: number, bwLb: number): BProg {
  const oneRm = epley(perHandLb * 2, reps);
  return progFromValue(BENCH_RATIO_ANCHORS, oneRm / bwLb, t => {
    const targetPerHand = (t * bwLb) / 2 / (1 + reps / 30);
    return `~${Math.ceil(targetPerHand)} lb/hand @ ${reps}r`;
  }, d => Math.ceil(d * bwLb / 5));
}
export function curlProg(perHandLb: number, reps: number): BProg {
  const oneRm = epley(perHandLb, reps);
  return progFromValue(CURL_1RM_ANCHORS, oneRm, t => {
    const targetPerHand = t / (1 + reps / 30);
    return `~${Math.ceil(targetPerHand)} lb/hand @ ${reps}r`;
  }, d => Math.ceil(d / 5));
}

// percentile label for a level (level == percentile in this system)
export function percentileLabel(level: number): string {
  if (level >= 99) return 'top 1%';
  if (level >= 90) return `top ${100 - level}%`;
  if (level >= 50) return `${level}th pct`;
  return `${level}th pct`;
}
