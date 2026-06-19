import type { Intensity, SkillLevel } from './types';

export interface SkillDef {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  bar: string;        // gradient for xp bar
  glow: string;
}

// Constitution = "showing up". Always trains. The other three are picked per session.
export const SKILLS: SkillDef[] = [
  { id: 'constitution', label: 'Constitution', icon: '❤️', blurb: 'Showing up. Every session feeds it.',          bar: 'linear-gradient(90deg,#9c7c3e,#ecd49b)', glow: 'rgba(236,212,155,0.45)' },
  { id: 'strength',     label: 'Strength',     icon: '⚔️', blurb: 'Lifting & resistance training.',                bar: 'linear-gradient(90deg,#b3402f,#f5765a)', glow: 'rgba(245,118,90,0.45)'  },
  { id: 'endurance',    label: 'Endurance',    icon: '🏃', blurb: 'Cardio, conditioning, wind.',                  bar: 'linear-gradient(90deg,#3f8f4f,#82c97a)', glow: 'rgba(130,201,122,0.45)' },
  { id: 'mobility',     label: 'Mobility',     icon: '🧘', blurb: 'Stretching, mobility, recovery.',              bar: 'linear-gradient(90deg,#3f6fd8,#7c9ef5)', glow: 'rgba(124,158,245,0.45)' },
];

export const TRAINABLE = SKILLS.filter(s => s.id !== 'constitution');
export const CONSTITUTION = 'constitution';
export const MAX_LEVEL = 99;

export function skillDef(id: string): SkillDef {
  return SKILLS.find(s => s.id === id) || SKILLS[0];
}

// XP awarded per trained skill, by intensity. Showing up always pays Constitution.
export const INTENSITY_XP: Record<Intensity, number> = { light: 40, solid: 90, beast: 180 };
export const SHOWUP_XP = 75;
export const INTENSITY_LABEL: Record<Intensity, string> = { light: 'Light', solid: 'Solid', beast: 'Beast' };

// ── RuneScape XP curve ──────────────────────────────────────────────
// Cumulative XP required to *reach* a given level (index = level).
const XP_TABLE: number[] = (() => {
  const table = [0, 0]; // table[1] = 0 (level 1 needs 0 xp)
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
  for (let lvl = MAX_LEVEL; lvl >= 1; lvl--) {
    if (xp >= XP_TABLE[lvl]) return lvl;
  }
  return 1;
}

export function skillLevel(xp: number): SkillLevel {
  const level = levelFromXp(xp);
  if (level >= MAX_LEVEL) {
    return { level: MAX_LEVEL, cur: 0, span: 1, pct: 100, toNext: 0, maxed: true };
  }
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const span = next - base;
  const cur = xp - base;
  return {
    level,
    cur,
    span,
    pct: span ? Math.round((cur / span) * 100) : 0,
    toNext: next - xp,
    maxed: false,
  };
}
