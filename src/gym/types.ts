export type Intensity = 'light' | 'solid' | 'beast';

export interface GymSession {
  id: string;
  date: string;        // local YYYY-MM-DD
  ts: number;          // epoch ms, for ordering
  skills: string[];    // trained skill ids (excludes constitution)
  intensity: Intensity;
  note?: string;
  xp: Record<string, number>; // xp awarded this session, per skill id
}

export interface GymState {
  sessions: GymSession[];
  skillXp: Record<string, number>; // cumulative xp per skill id
  weeklyGoal: number;              // sessions/week target (default 3)
  created: string;                 // YYYY-MM-DD
}

export interface SkillLevel {
  level: number;       // 1..99
  cur: number;         // xp into current level
  span: number;        // xp from this level to next
  pct: number;         // 0..100 progress to next level
  toNext: number;      // xp remaining to next level
  maxed: boolean;
}
