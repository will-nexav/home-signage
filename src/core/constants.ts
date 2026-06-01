import type { LevelInfo, Habit, Category, Reward } from './types';

export const FLOOR_PCT = 90;

export const ACCENTS: Record<string, { gem: string; glow: string; text: string; bar: string }> = {
  foundations: { gem: '#7c9ef5', glow: 'rgba(124,158,245,0.35)', text: '#a8c0ff', bar: 'linear-gradient(90deg,#5b7de8,#7c9ef5)' },
  ai:          { gem: '#b07ef5', glow: 'rgba(176,126,245,0.35)', text: '#cca8ff', bar: 'linear-gradient(90deg,#8b5ed8,#b07ef5)' },
  sales:       { gem: '#f5a07e', glow: 'rgba(245,160,126,0.35)', text: '#ffc4a8', bar: 'linear-gradient(90deg,#d87a50,#f5a07e)' },
  default:     { gem: '#c9a86b', glow: 'rgba(201,168,107,0.35)', text: '#ecd49b', bar: 'linear-gradient(90deg,#9c7c3e,#c9a86b)' },
};

export function accent(a: string) {
  return ACCENTS[a] || ACCENTS.default;
}

export const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'];

export function crestTier(level: number) {
  if (level >= 15) return 'mythic';
  if (level >= 10) return 'legendary';
  if (level >= 6)  return 'epic';
  if (level >= 3)  return 'rare';
  return 'common';
}

export const LEVELS: LevelInfo[] = [
  { level: 1,  label: 'Novice Wanderer',       min: 0,    max: 200   },
  { level: 2,  label: 'Apprentice Scout',       min: 200,  max: 500   },
  { level: 3,  label: 'Journeyman Seeker',      min: 500,  max: 900   },
  { level: 4,  label: 'Adept Pathfinder',       min: 900,  max: 1400  },
  { level: 5,  label: 'Skilled Wayfarer',       min: 1400, max: 2100  },
  { level: 6,  label: 'Veteran Ranger',         min: 2100, max: 3000  },
  { level: 7,  label: 'Elite Strider',          min: 3000, max: 4100  },
  { level: 8,  label: 'Champion Voyager',       min: 4100, max: 5500  },
  { level: 9,  label: 'Master Trailblazer',     min: 5500, max: 7200  },
  { level: 10, label: 'Legendary Pathfinder',   min: 7200, max: 9200  },
  { level: 11, label: 'Mythic Seeker',          min: 9200, max: 11500 },
  { level: 12, label: 'Ascendant Wanderer',     min: 11500,max: 14200 },
  { level: 13, label: 'Transcendent Voyager',   min: 14200,max: 17500 },
  { level: 14, label: 'Exalted Champion',       min: 17500,max: 21500 },
  { level: 15, label: 'Sovereign Pathfinder',   min: 21500,max: 26000 },
  { level: 16, label: 'Divine Strider',         min: 26000,max: 31500 },
  { level: 17, label: 'Celestial Ranger',       min: 31500,max: 38000 },
  { level: 18, label: 'Eternal Wayfarer',       min: 38000,max: 46000 },
  { level: 19, label: 'Primordial Seeker',      min: 46000,max: 55000 },
  { level: 20, label: 'The Undying Legend',     min: 55000,max: 999999},
];

export const HABITS_SEED: Omit<Habit, 'days'>[] = [
  { id: 'h-wake',    label: 'Wake before 7 AM',          icon: '🌅', xp: 15 },
  { id: 'h-pray',    label: 'Morning prayer & gratitude', icon: '🙏', xp: 20 },
  { id: 'h-workout', label: 'Workout / physical training',icon: '⚔️', xp: 25 },
  { id: 'h-read',    label: 'Read 20+ minutes',           icon: '📖', xp: 15 },
  { id: 'h-journal', label: 'Evening journal',            icon: '📜', xp: 15 },
  { id: 'h-nogame',  label: 'No gaming today',            icon: '🛡️', xp: 10 },
  { id: 'h-cold',    label: 'Cold shower',                icon: '❄️', xp: 10 },
  { id: 'h-diet',    label: 'Ate clean / on diet',        icon: '🥗', xp: 15 },
];

export const SEED: { cats: Omit<Category, never>[] } = {
  cats: [
    {
      id: 'foundations',
      label: 'Foundations',
      icon: '🏰',
      accent: 'foundations',
      groups: [
        {
          id: 'foundations-faith',
          label: 'Faith & Character',
          tasks: [
            { id: 'f-bible',    label: 'Complete Bible reading plan (365 days)',          xp: 200, done: false },
            { id: 'f-prayer',   label: 'Establish a consistent daily prayer ritual',      xp: 150, done: false },
            { id: 'f-church',   label: 'Attend church every Sunday for 3 months',         xp: 100, done: false },
            { id: 'f-fast',     label: 'Complete a 3-day water fast',                     xp: 75,  done: false },
            { id: 'f-mentor',   label: 'Find a faith mentor / accountability partner',    xp: 100, done: false },
          ],
        },
        {
          id: 'foundations-discipline',
          label: 'Discipline & Habits',
          tasks: [
            { id: 'f-wake',     label: 'Wake before 6 AM for 30 consecutive days',        xp: 150, done: false },
            { id: 'f-noporn',   label: '90-day no-porn / no-dopamine-trap streak',        xp: 200, done: false },
            { id: 'f-nogaming', label: '60-day no-gaming streak',                         xp: 150, done: false },
            { id: 'f-phone',    label: 'Phone-free mornings for 30 days',                 xp: 75,  done: false },
            { id: 'f-journal',  label: 'Journal every day for 60 days',                   xp: 100, done: false },
          ],
        },
        {
          id: 'foundations-money',
          label: 'Personal Finance',
          tasks: [
            { id: 'f-budget',   label: 'Build and stick to monthly budget for 3 months',  xp: 100, done: false },
            { id: 'f-invest',   label: 'Set up automatic investing (index funds)',         xp: 75,  done: false },
            { id: 'f-nw50k',    label: 'Reach $50k net worth milestone',                  xp: 200, done: false },
            { id: 'f-nw100k',   label: 'Reach $100k net worth milestone',                 xp: 300, done: false },
            { id: 'f-debtfree', label: 'Become completely debt-free',                     xp: 250, done: false },
          ],
        },
        {
          id: 'foundations-health',
          label: 'Physical Health',
          tasks: [
            { id: 'f-bw175',    label: 'Reach 175 lb body weight',                        xp: 100, done: false },
            { id: 'f-bw165',    label: 'Reach 165 lb body weight',                        xp: 150, done: false },
            { id: 'f-bench',    label: 'Bench press 225 lb',                              xp: 100, done: false },
            { id: 'f-5k',       label: 'Run a 5K in under 25 minutes',                    xp: 75,  done: false },
            { id: 'f-vo2',      label: 'Achieve VO2 max of 45+',                          xp: 150, done: false },
            { id: 'f-sleep',    label: '30-day streak of 7.5h+ quality sleep',            xp: 100, done: false },
          ],
        },
        {
          id: 'foundations-mind',
          label: 'Mind & Learning',
          tasks: [
            { id: 'f-books12',  label: 'Read 12 books this year',                         xp: 200, done: false },
            { id: 'f-books24',  label: 'Read 24 books total',                             xp: 300, done: false },
            { id: 'f-spanish',  label: 'Complete Spanish A2 level',                       xp: 100, done: false },
            { id: 'f-spanishb1',label: 'Complete Spanish B1 level',                       xp: 150, done: false },
            { id: 'f-drive',    label: 'Get driver\'s license',                           xp: 75,  done: false },
          ],
        },
      ],
    },
    {
      id: 'ai',
      label: 'AI Mastery',
      icon: '🤖',
      accent: 'ai',
      groups: [
        {
          id: 'ai-skills',
          label: 'Technical Skills',
          tasks: [
            { id: 'ai-python',  label: 'Complete Python for AI/ML fundamentals course',   xp: 150, done: false },
            { id: 'ai-prompt',  label: 'Master prompt engineering (publish cheat sheet)',  xp: 100, done: false },
            { id: 'ai-api',     label: 'Build 3 production apps with LLM APIs',           xp: 200, done: false },
            { id: 'ai-rag',     label: 'Build a RAG system from scratch',                 xp: 150, done: false },
            { id: 'ai-agents',  label: 'Deploy autonomous AI agent pipeline',             xp: 200, done: false },
            { id: 'ai-finetune',label: 'Fine-tune a model for a real use case',           xp: 250, done: false },
          ],
        },
        {
          id: 'ai-product',
          label: 'AI Products & Revenue',
          tasks: [
            { id: 'ai-saas1',   label: 'Launch AI SaaS product with paying customers',    xp: 300, done: false },
            { id: 'ai-1k-mrr',  label: 'Reach $1k MRR from AI products',                 xp: 200, done: false },
            { id: 'ai-5k-mrr',  label: 'Reach $5k MRR from AI products',                 xp: 300, done: false },
            { id: 'ai-client1', label: 'Land first AI consulting client ($2k+ project)',  xp: 150, done: false },
            { id: 'ai-agency',  label: 'Build AI automation agency to $10k/month',        xp: 400, done: false },
          ],
        },
        {
          id: 'ai-content',
          label: 'Content & Authority',
          tasks: [
            { id: 'ai-yt10',    label: 'Publish 10 AI tutorial videos on YouTube',        xp: 150, done: false },
            { id: 'ai-yt100',   label: 'Reach 1,000 YouTube subscribers',                xp: 200, done: false },
            { id: 'ai-news',    label: 'Launch AI newsletter with 500 subscribers',       xp: 150, done: false },
            { id: 'ai-speak',   label: 'Speak at an AI / tech event',                    xp: 200, done: false },
            { id: 'ai-course',  label: 'Create and sell an AI course ($1k+ revenue)',     xp: 250, done: false },
          ],
        },
      ],
    },
    {
      id: 'sales',
      label: 'Sales & Business',
      icon: '⚡',
      accent: 'sales',
      groups: [
        {
          id: 'sales-skills',
          label: 'Sales Skills',
          tasks: [
            { id: 's-calls100', label: 'Complete 100 cold calls (log each)',               xp: 200, done: false },
            { id: 's-close10',  label: 'Close 10 deals personally tracked',                xp: 200, done: false },
            { id: 's-crm',      label: 'Master CRM and build a real pipeline',            xp: 75,  done: false },
            { id: 's-script',   label: 'Write and test 3 proven sales scripts',           xp: 100, done: false },
            { id: 's-obj',      label: 'Master the top 10 objection handlers',            xp: 100, done: false },
            { id: 's-book',     label: 'Read 5 sales / persuasion books',                 xp: 100, done: false },
          ],
        },
        {
          id: 'sales-nexav',
          label: 'NEXAV Growth',
          tasks: [
            { id: 'n-100k-rev', label: 'NEXAV hits $100k total revenue',                  xp: 300, done: false },
            { id: 'n-500k-rev', label: 'NEXAV hits $500k total revenue',                  xp: 400, done: false },
            { id: 'n-hire1',    label: 'Make first full-time hire at NEXAV',              xp: 150, done: false },
            { id: 'n-hire5',    label: 'Build a team of 5+ at NEXAV',                    xp: 300, done: false },
            { id: 'n-brand',    label: 'NEXAV brand recognized in the industry',          xp: 200, done: false },
          ],
        },
        {
          id: 'sales-income',
          label: 'Income Milestones',
          tasks: [
            { id: 'i-100k-yr',  label: 'Earn $100k in a single year (all sources)',       xp: 400, done: false },
            { id: 'i-10k-mo',   label: 'Hit $10k in a single month',                     xp: 300, done: false },
            { id: 'i-20k-mo',   label: 'Hit $20k in a single month',                     xp: 400, done: false },
            { id: 'i-passive',  label: 'Build $2k/month passive income stream',           xp: 300, done: false },
          ],
        },
        {
          id: 'sales-lifestyle',
          label: 'Lifestyle & Milestones',
          tasks: [
            { id: 'l-move',     label: 'Move to a city that excites me',                  xp: 150, done: false },
            { id: 'l-car',      label: 'Buy my dream car (cash or low interest)',         xp: 200, done: false },
            { id: 'l-travel3',  label: 'Travel to 3 new countries',                      xp: 150, done: false },
            { id: 'l-suit',     label: 'Own a custom-tailored suit',                     xp: 50,  done: false },
            { id: 'l-speak',    label: 'Give a keynote speech / TEDx talk',              xp: 300, done: false },
          ],
        },
      ],
    },
  ],
};

export const DAILY_SEQUENCE: string[] = [
  'Morning Power Block',
  'Deep Work Sprint',
  'Outreach & Pipeline',
  'Learning Block',
  'Admin & Systems',
  'Reflection & Planning',
];

export const DAILY_TASKS_SEED: Record<string, Array<{ id: string; label: string; xp: number; tag?: string }>> = {
  'Morning Power Block': [
    { id: 'dt-wake',    label: 'Wake up, no snooze',              xp: 10 },
    { id: 'dt-pray',    label: 'Prayer & scripture',              xp: 15 },
    { id: 'dt-journal', label: 'Morning journal (5 min)',          xp: 10 },
    { id: 'dt-workout', label: 'Workout complete',                xp: 25 },
    { id: 'dt-cold',    label: 'Cold shower',                     xp: 10 },
    { id: 'dt-plan',    label: 'Review daily plan & top 3 goals', xp: 10 },
  ],
  'Deep Work Sprint': [
    { id: 'dt-dw1',  label: '90-min deep work block 1',          xp: 30 },
    { id: 'dt-dw2',  label: '90-min deep work block 2',          xp: 30 },
    { id: 'dt-focus',label: 'No social media during work hours',  xp: 15 },
  ],
  'Outreach & Pipeline': [
    { id: 'dt-calls', label: '10+ cold calls / outreach attempts', xp: 25 },
    { id: 'dt-crm',   label: 'Update CRM / pipeline',             xp: 10 },
    { id: 'dt-follow',label: 'Follow up with warm leads',         xp: 15 },
  ],
  'Learning Block': [
    { id: 'dt-read',  label: 'Read 20+ min (non-fiction)',        xp: 15 },
    { id: 'dt-course',label: 'Complete a course lesson',          xp: 15 },
  ],
  'Admin & Systems': [
    { id: 'dt-email', label: 'Clear email inbox',                 xp: 10 },
    { id: 'dt-tasks', label: 'Review & update task list',         xp: 10 },
  ],
  'Reflection & Planning': [
    { id: 'dt-eve-j', label: 'Evening journal',                   xp: 15 },
    { id: 'dt-tmrw',  label: 'Plan tomorrow\'s top 3',           xp: 10 },
    { id: 'dt-grat',  label: 'Write 3 gratitudes',               xp: 10 },
    { id: 'dt-nogame',label: 'No gaming today ✓',                xp: 10 },
  ],
};

export const WEEKLY_TASKS_SEED: Array<{ id: string; label: string; xp: number }> = [
  { id: 'wt-review',  label: 'Weekly review (wins, losses, plan)', xp: 50 },
  { id: 'wt-calls50', label: '50+ outreach contacts this week',    xp: 40 },
  { id: 'wt-content', label: 'Publish 1 piece of content',         xp: 35 },
  { id: 'wt-learn',   label: 'Complete a full course module',      xp: 30 },
  { id: 'wt-church',  label: 'Attend church',                      xp: 25 },
  { id: 'wt-network', label: 'Connect with 3 new people',          xp: 25 },
  { id: 'wt-health',  label: '4+ workouts this week',              xp: 30 },
  { id: 'wt-clean',   label: 'Clean + organize workspace',         xp: 20 },
];

export const REWARDS: Reward[] = [
  { id: 'r-coffee',  label: 'Fancy coffee',      xpCost: 50,   icon: '☕' },
  { id: 'r-movie',   label: 'Movie night',       xpCost: 75,   icon: '🎬' },
  { id: 'r-game2h',  label: '2h gaming session', xpCost: 100,  icon: '🎮', unlockLevel: 3 },
  { id: 'r-dinner',  label: 'Nice dinner out',   xpCost: 150,  icon: '🍽️' },
  { id: 'r-gear',    label: 'Gear / clothing',   xpCost: 200,  icon: '👑' },
  { id: 'r-weekend', label: 'Weekend adventure', xpCost: 400,  icon: '🏔️', unlockLevel: 5 },
];

export const KEY          = 'questlog_v2';
export const CHECKLIST_KEY = 'questlog_checklist_v2';
export const WEEKLY_KEY    = 'questlog_weekly_v2';
export const NW_KEY        = 'questlog_nw_v2';
export const HEALTH_KEY    = 'questlog_health_v2';
export const BIZ_KEY       = 'questlog_biz_v2';
