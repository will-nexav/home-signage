import type { Activity, LogEntry } from './types';

export type SkillKind = 'benchmark' | 'consistency' | 'milestone' | 'aggregate';

export interface SkillDef {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  bar: string;
  color: string;
  glow: string;
  kind: SkillKind;
  group: 'combat' | 'support';
  activity?: Activity; // for benchmark / consistency logging
  unit?: string;
}

const RED = { bar: 'linear-gradient(90deg,#b3402f,#f5765a)', color: '#f5765a', glow: 'rgba(245,118,90,0.45)' };
const GOLD = { bar: 'linear-gradient(90deg,#9c7c3e,#ecd49b)', color: '#ecd49b', glow: 'rgba(236,212,155,0.45)' };
const GREEN = { bar: 'linear-gradient(90deg,#3f8f4f,#82c97a)', color: '#82c97a', glow: 'rgba(130,201,122,0.45)' };
const BLUE = { bar: 'linear-gradient(90deg,#3f6fd8,#7c9ef5)', color: '#7c9ef5', glow: 'rgba(124,158,245,0.45)' };
const PURPLE = { bar: 'linear-gradient(90deg,#7b46c9,#c4a3f5)', color: '#c4a3f5', glow: 'rgba(196,163,245,0.45)' };
const STEEL = { bar: 'linear-gradient(90deg,#5a6678,#9fb0c8)', color: '#9fb0c8', glow: 'rgba(159,176,200,0.4)' };
const TEAL = { bar: 'linear-gradient(90deg,#2f8f86,#5fd6c4)', color: '#5fd6c4', glow: 'rgba(95,214,196,0.4)' };
const AMBER = { bar: 'linear-gradient(90deg,#c2682f,#f0a35a)', color: '#f0a35a', glow: 'rgba(240,163,90,0.45)' };

export const SKILLS: Record<string, SkillDef> = {
  constitution: { id: 'constitution', label: 'Constitution', icon: '❤️', blurb: "Cardio engine — Mitch's treadmill test.", kind: 'benchmark', group: 'combat', activity: 'cardio', unit: 'min', ...RED },
  attack:       { id: 'attack',       label: 'Attack',       icon: '⚔️', blurb: 'Aesthetics — biceps & chest size.',     kind: 'aggregate', group: 'combat', ...GOLD },
  biceps:       { id: 'biceps',       label: 'Biceps',       icon: '🦾', blurb: 'Flexed arm circumference.',             kind: 'benchmark', group: 'combat', activity: 'biceps', unit: 'cm', ...GOLD },
  chest:        { id: 'chest',        label: 'Chest',        icon: '🫁', blurb: 'Chest circumference.',                  kind: 'benchmark', group: 'combat', activity: 'chest', unit: 'cm', ...GOLD },
  strength:     { id: 'strength',     label: 'Strength',     icon: '💪', blurb: 'Weighted lifts — bench & curl.',        kind: 'aggregate', group: 'combat', ...RED },
  bench:        { id: 'bench',        label: 'Bench',        icon: '🏋️', blurb: 'Dumbbell bench press (per hand).',      kind: 'benchmark', group: 'combat', activity: 'bench', unit: 'lb', ...RED },
  curl:         { id: 'curl',         label: 'Curl',         icon: '🔁', blurb: 'Dumbbell curl (per hand).',             kind: 'benchmark', group: 'combat', activity: 'curl', unit: 'lb', ...AMBER },
  defence:      { id: 'defence',      label: 'Defence',      icon: '🛡️', blurb: 'Durability — back & hand rehab.',       kind: 'consistency', group: 'combat', activity: 'rehab', ...STEEL },
  ranged:       { id: 'ranged',       label: 'Ranged',       icon: '🏹', blurb: 'Calisthenics — bodyweight mastery.',    kind: 'aggregate', group: 'combat', ...GREEN },
  pullups:      { id: 'pullups',      label: 'Pull-ups',     icon: '🧗', blurb: 'Max consecutive strict pull-ups.',     kind: 'benchmark', group: 'combat', activity: 'pullups', unit: 'reps', ...GREEN },
  pushups:      { id: 'pushups',      label: 'Push-ups',     icon: '🤸', blurb: 'Max consecutive push-ups.',            kind: 'benchmark', group: 'combat', activity: 'pushups', unit: 'reps', ...GREEN },
  dips:         { id: 'dips',         label: 'Dips',         icon: '🔽', blurb: 'Max consecutive dips.',                 kind: 'benchmark', group: 'combat', activity: 'dips', unit: 'reps', ...GREEN },
  magic:        { id: 'magic',        label: 'Magic',        icon: '🔮', blurb: 'Spellbook of tricks — feats you unlock.', kind: 'milestone', group: 'combat', ...PURPLE },
  agility:      { id: 'agility',      label: 'Agility',      icon: '🏃', blurb: 'Mobility & flexibility.',               kind: 'consistency', group: 'support', activity: 'mobility', ...BLUE },
  prayer:       { id: 'prayer',       label: 'Prayer',       icon: '🙏', blurb: 'Meditation — calm the mind.',           kind: 'consistency', group: 'support', activity: 'meditate', ...TEAL },
};

export const SKILL_ORDER = ['constitution', 'attack', 'strength', 'defence', 'ranged', 'magic', 'agility', 'prayer'];
export const COMBAT_SKILLS = ['constitution', 'attack', 'strength', 'defence', 'ranged', 'magic'];
export const SUBS: Record<string, string[]> = {
  attack: ['biceps', 'chest'],
  strength: ['bench', 'curl'],
  ranged: ['pullups', 'pushups', 'dips'],
};
export const ALL_IDS = [...SKILL_ORDER, ...Object.values(SUBS).flat()];

export function skillDef(id: string): SkillDef { return SKILLS[id] || SKILLS.constitution; }

// the loggable (top-level) skill a sub belongs to — used to open the log sheet
export function logSkillFor(id: string): string {
  for (const [parent, subs] of Object.entries(SUBS)) if (subs.includes(id)) return parent;
  return id;
}

export const BODYWEIGHT_DEFAULT_LB = 190; // ≈ 86.4 kg
export const WEEKLY_CARDIO_GOAL = 3;
export const PER_SESSION_XP = 80; // consistency skills (Defence / Agility / Prayer)

// ── Magic: the spellbook of tricks ──
export interface Feat { id: string; label: string; xp: number; tier: number; }
export const FEATS: Feat[] = [
  { id: 'plank90',   label: '90-second plank',        xp: 200,  tier: 1 },
  { id: 'crow',      label: 'Crow pose hold',         xp: 250,  tier: 1 },
  { id: 'wallhs',    label: 'Wall handstand 30s',     xp: 350,  tier: 1 },
  { id: 'lsit',      label: 'L-sit 10s',              xp: 450,  tier: 2 },
  { id: 'pistol',    label: 'Pistol squat',           xp: 550,  tier: 2 },
  { id: 'pseudo',    label: 'Pseudo-planche push-up', xp: 650,  tier: 2 },
  { id: 'fltuck',    label: 'Tuck front lever',       xp: 800,  tier: 3 },
  { id: 'muscleup',  label: 'Strict muscle-up',       xp: 1000, tier: 3 },
  { id: 'freehs',    label: 'Freestanding handstand', xp: 1200, tier: 3 },
  { id: 'hspu',      label: 'Handstand push-up',      xp: 1600, tier: 4 },
  { id: 'frontlvr',  label: 'Full front lever',       xp: 2200, tier: 4 },
  { id: 'flag',      label: 'Human flag',             xp: 3200, tier: 5 },
];

// ── consistency / milestone leveling: RuneScape XP curve ──
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

// ── benchmark leveling: level = percentile via piecewise-linear anchors ──
type Anchor = [value: number, level: number];

const END_ANCHORS: Anchor[]    = [[14, 1], [18, 20], [21, 50], [22, 60], [23.5, 78], [25, 90], [26, 99]];
const PULL_ANCHORS: Anchor[]   = [[0, 3], [1, 15], [2, 25], [3, 33], [5, 50], [8, 70], [10, 80], [12, 85], [15, 90], [20, 96], [25, 99]];
const PUSH_ANCHORS: Anchor[]   = [[0, 3], [5, 15], [10, 30], [20, 50], [30, 68], [40, 82], [50, 90], [70, 96], [100, 99]];
const DIP_ANCHORS: Anchor[]    = [[0, 5], [3, 20], [8, 40], [15, 60], [22, 75], [30, 88], [40, 95], [50, 99]];
const BICEPS_ANCHORS: Anchor[] = [[28, 5], [31, 30], [33, 50], [35.5, 65], [38, 80], [40.5, 90], [43, 96], [45.7, 99]]; // cm flexed
const CHEST_ANCHORS: Anchor[]  = [[88, 5], [95, 30], [100, 50], [107, 65], [112, 78], [118, 88], [124, 95], [130, 99]]; // cm
const BENCH_RATIO_ANCHORS: Anchor[] = [[0.25, 5], [0.5, 20], [0.75, 35], [1.0, 50], [1.25, 65], [1.5, 80], [1.75, 90], [2.0, 97], [2.25, 99]];
const CURL_1RM_ANCHORS: Anchor[]    = [[8, 5], [15, 30], [25, 50], [35, 70], [45, 85], [55, 95], [65, 99]];

function interp(a: Anchor[], v: number): number {
  if (v <= a[0][0]) return a[0][1];
  const last = a[a.length - 1];
  if (v >= last[0]) return last[1];
  for (let i = 0; i < a.length - 1; i++) {
    const [v0, l0] = a[i], [v1, l1] = a[i + 1];
    if (v >= v0 && v <= v1) return l0 + (l1 - l0) * ((v - v0) / (v1 - v0));
  }
  return 1;
}
function invInterp(a: Anchor[], lvl: number): number {
  if (lvl <= a[0][1]) return a[0][0];
  const last = a[a.length - 1];
  if (lvl >= last[1]) return last[0];
  for (let i = 0; i < a.length - 1; i++) {
    const [v0, l0] = a[i], [v1, l1] = a[i + 1];
    if (lvl >= l0 && lvl <= l1) return v0 + (v1 - v0) * ((lvl - l0) / (l1 - l0));
  }
  return last[0];
}
export const clampLvl = (l: number) => Math.max(1, Math.min(MAX_LEVEL, Math.round(l)));
export const epley = (w: number, reps: number) => w * (1 + reps / 30);

export interface BProg { level: number; pct: number; nextLevel: number; need: string; effort: number; maxed: boolean; }
function prog(anchors: Anchor[], value: number, fmt: (target: number) => string, effortOf: (delta: number) => number): BProg {
  const level = clampLvl(interp(anchors, value));
  if (level >= MAX_LEVEL) return { level, pct: 100, nextLevel: level, need: 'MAXED', effort: Infinity, maxed: true };
  const lowV = invInterp(anchors, level), highV = invInterp(anchors, level + 1);
  const pct = Math.max(0, Math.min(100, Math.round(((value - lowV) / (highV - lowV)) * 100)));
  return { level, pct, nextLevel: level + 1, need: fmt(highV), effort: effortOf(highV - value), maxed: false };
}
const moreReps = (t: number, cur: number) => { const n = Math.max(1, Math.ceil(t - cur)); return `${n} more rep${n === 1 ? '' : 's'}`; };

// the value used to rank a benchmark skill's "best" entry
export function metricValue(id: string, e: LogEntry, bwLb: number): number {
  switch (id) {
    case 'constitution': return e.minutes || 0;
    case 'biceps': case 'chest': return e.measure || 0;
    case 'pullups': case 'pushups': case 'dips': return e.reps || 0;
    case 'bench': return epley((e.weight || 0) * 2, e.reps || 0) / bwLb;
    case 'curl': return epley(e.weight || 0, e.reps || 0);
    default: return 0;
  }
}

// progress object for a benchmark skill given its best entry
export function benchmarkProg(id: string, e: LogEntry, bwLb: number): BProg {
  switch (id) {
    case 'constitution': { const m = e.minutes || 0; return prog(END_ANCHORS, m, t => `${(t - m).toFixed(1)} more min`, d => d * 8); }
    case 'biceps':  { const c = e.measure || 0; return prog(BICEPS_ANCHORS, c, t => `${(t - c).toFixed(1)} more cm`, d => Math.ceil(d * 4)); }
    case 'chest':   { const c = e.measure || 0; return prog(CHEST_ANCHORS, c, t => `${(t - c).toFixed(1)} more cm`, d => Math.ceil(d * 2)); }
    case 'pullups': { const r = e.reps || 0; return prog(PULL_ANCHORS, r, t => moreReps(t, r), d => Math.ceil(d)); }
    case 'pushups': { const r = e.reps || 0; return prog(PUSH_ANCHORS, r, t => moreReps(t, r), d => Math.ceil(d / 3)); }
    case 'dips':    { const r = e.reps || 0; return prog(DIP_ANCHORS, r, t => moreReps(t, r), d => Math.ceil(d / 2)); }
    case 'bench':   { const w = e.weight || 0, r = e.reps || 0; return prog(BENCH_RATIO_ANCHORS, epley(w * 2, r) / bwLb, t => `~${Math.ceil((t * bwLb) / 2 / (1 + r / 30))} lb/hand @ ${r}r`, d => Math.ceil(d * bwLb / 5)); }
    case 'curl':    { const w = e.weight || 0, r = e.reps || 0; return prog(CURL_1RM_ANCHORS, epley(w, r), t => `~${Math.ceil(t / (1 + r / 30))} lb/hand @ ${r}r`, d => Math.ceil(d / 5)); }
    default: return { level: 1, pct: 0, nextLevel: 2, need: '', effort: Infinity, maxed: false };
  }
}

export function statLabel(id: string, e: LogEntry): string {
  switch (id) {
    case 'constitution': return `${e.minutes} min`;
    case 'biceps': case 'chest': return `${e.measure} cm`;
    case 'pullups': case 'pushups': case 'dips': return `${e.reps} reps`;
    case 'bench': case 'curl': return `${e.weight}lb×${e.reps}`;
    default: return '';
  }
}

export function percentileLabel(level: number): string {
  if (level >= 99) return 'top 1%';
  if (level > 90) return `top ${100 - level}%`;
  return `${level}th pct`;
}
