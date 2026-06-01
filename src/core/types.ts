export interface Task {
  id: string;
  label: string;
  xp: number;
  done: boolean;
  note?: string;
}

export interface Group {
  id: string;
  label: string;
  tasks: Task[];
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  accent: string;
  groups: Group[];
}

export interface Habit {
  id: string;
  label: string;
  icon: string;
  xp: number;
  days: string[]; // ISO date strings
}

export interface AppState {
  cats: Category[];
  habits: Habit[];
  xp: number;
  level: number;
  date: string;
  weekStart: string;
}

export interface LevelInfo {
  level: number;
  label: string;
  min: number;
  max: number;
}

export interface AccentColors {
  gem: string;
  glow: string;
  text: string;
  bar: string;
}

export interface NWAsset {
  id: string;
  label: string;
  value: number;
  note?: string;
}

export interface NWLiability {
  id: string;
  label: string;
  value: number;
  note?: string;
}

export interface NWSnapshot {
  ym: string; // "YYYY-MM"
  assets: NWAsset[];
  liabilities: NWLiability[];
}

export interface Company {
  id: string;
  name: string;
  role: string;
  revenue: number;
  target: number;
  deals: number;
  dealTarget: number;
  note?: string;
}

export interface HealthState {
  weight: number;
  weightTarget: number;
  vo2max: number;
  vo2maxTarget: number;
  sleep: number;
  sleepTarget: number;
  strength: number;
  strengthTarget: number;
  history: { ym: string; weight: number; vo2max: number }[];
}

export interface BizState {
  companies: Company[];
}

export interface NWState {
  snapshots: NWSnapshot[];
}

export type ViewName = 'home' | 'category' | 'stats' | 'today' | 'overview' | 'networth' | 'health' | 'business';

export interface ViewState {
  view: ViewName;
  catId?: string;
}

export interface Reward {
  id: string;
  label: string;
  xpCost: number;
  icon: string;
  unlockLevel?: number;
}

export interface DailyTask {
  id: string;
  label: string;
  xp: number;
  tag?: string;
  done: boolean;
  rolledFrom?: string;
}

export interface WeeklyTask {
  id: string;
  label: string;
  xp: number;
  done: boolean;
}

export interface ChecklistState {
  date: string;
  daily: DailyTask[];
  sequence: number;
}

export interface WeeklyState {
  weekStart: string;
  weekly: WeeklyTask[];
}
