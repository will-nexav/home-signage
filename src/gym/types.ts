export type Activity = 'cardio' | 'bench' | 'curl' | 'pullups' | 'stretch';

// A single logged entry. Benchmark activities carry a measured value; all
// activities feed the consistency skills (Constitution / Mobility).
export interface LogEntry {
  id: string;
  date: string;        // local YYYY-MM-DD
  ts: number;          // epoch ms
  activity: Activity;
  minutes?: number;    // cardio test result (Mitch's treadmill protocol)
  weight?: number;     // bench/curl: weight per hand, in lb
  reps?: number;       // bench/curl/pullups reps
  note?: string;
}

export interface GymState {
  log: LogEntry[];
  bodyweightLb: number; // for strength-to-bodyweight ratios
  weeklyGoal: number;   // cardio sessions per week
  created: string;
}

// Levels for every tracked skill (the 4 headline + 3 strength sub-skills).
export interface Levels {
  constitution: number;
  mobility: number;
  endurance: number;
  bench: number;
  curl: number;
  pullups: number;
  strength: number; // average of bench/curl/pullups
}
