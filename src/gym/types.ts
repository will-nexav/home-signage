export type Activity =
  | 'cardio' | 'bench' | 'curl' | 'tricep' | 'pullups' | 'pushups' | 'dips'
  | 'biceps' | 'chest' | 'legs' | 'mobility' | 'meditate';

export interface LogEntry {
  id: string;
  date: string;        // local YYYY-MM-DD
  ts: number;          // epoch ms
  activity: Activity;
  minutes?: number;    // cardio test / meditation minutes
  weight?: number;     // bench/curl: weight per hand (lb)
  reps?: number;       // bench/curl/pullups/pushups/dips
  measure?: number;    // biceps/chest circumference (cm)
  note?: string;
}

export interface GymState {
  log: LogEntry[];
  unlockedFeats: string[]; // Magic — trick ids unlocked
  bodyweightLb: number;
  weeklyGoal: number;      // cardio sessions per week
  created: string;
}

export type Levels = Record<string, number>;
