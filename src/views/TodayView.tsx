import { useState } from 'react';
import Panel from '../components/Panel';
import DailyTaskRow from '../components/DailyTaskRow';
import PBar from '../components/PBar';
import { DAILY_SEQUENCE, DAILY_TASKS_SEED } from '../core/constants';
import { weekStartStr } from '../core/engine';
import type { ChecklistState, WeeklyState, DailyTask } from '../core/types';

interface TodayViewProps {
  checklist: ChecklistState;
  weekly: WeeklyState;
  onDailyToggle: (id: string) => void;
  onDailyDelete: (id: string) => void;
  onDailyAdd: (label: string, xp: number) => void;
  onWeeklyToggle: (id: string) => void;
}

interface AddRowProps {
  onAdd: (label: string, xp: number) => void;
}

function AddRow({ onAdd }: AddRowProps) {
  const [label, setLabel] = useState('');
  const [xp, setXp] = useState('10');
  const [open, setOpen] = useState(false);

  function submit() {
    if (!label.trim()) return;
    onAdd(label.trim(), parseInt(xp) || 10);
    setLabel('');
    setOpen(false);
  }

  if (!open) {
    return (
      <button className="ghost-btn" style={{ width: '100%', marginTop: 8 }} onClick={() => setOpen(true)}>
        + Add task
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
      <input
        className="tome-input"
        placeholder="Task description..."
        value={label}
        onChange={e => setLabel(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false); }}
        autoFocus
        style={{ flex: 1 }}
      />
      <input
        className="tome-input"
        type="number"
        value={xp}
        onChange={e => setXp(e.target.value)}
        style={{ width: 60 }}
        placeholder="XP"
      />
      <button className="ghost-btn" onClick={submit}>Add</button>
      <button className="ghost-btn" onClick={() => setOpen(false)}>✕</button>
    </div>
  );
}


function MorningProgressBanner({ checklist }: { checklist: ChecklistState }) {
  const morningTasks = DAILY_TASKS_SEED['Morning Power Block'] || [];
  const morningIds = new Set(morningTasks.map(t => t.id));
  const doneCount = checklist.daily.filter(t => morningIds.has(t.id) && t.done).length;
  const totalCount = morningTasks.length;
  const pct = Math.round(doneCount / totalCount * 100);

  if (pct === 0) return null;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span className="eyebrow">Morning Block Progress</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--gold)' }}>{doneCount}/{totalCount}</span>
      </div>
      <PBar pct={pct} bar="linear-gradient(90deg,#d6b25e,#c9a86b)" height={5} />
    </div>
  );
}

export default function TodayView({ checklist, weekly, onDailyToggle, onDailyDelete, onDailyAdd, onWeeklyToggle }: TodayViewProps) {
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');

  const doneTasks = checklist.daily.filter(t => t.done).length;
  const totalTasks = checklist.daily.length;
  const totalXp = checklist.daily.filter(t => t.done).reduce((s, t) => s + t.xp, 0);

  const doneWeekly = weekly.weekly.filter(t => t.done).length;
  const totalWeekly = weekly.weekly.length;

  // Group daily tasks by sequence phase
  const grouped: Record<string, DailyTask[]> = {};
  const custom: DailyTask[] = [];

  const allSeedIds = new Set(
    Object.values(DAILY_TASKS_SEED).flatMap(tasks => tasks.map(t => t.id))
  );

  for (const task of checklist.daily) {
    if (!allSeedIds.has(task.id) && !task.rolledFrom) {
      custom.push(task);
      continue;
    }
    // Find which phase this task belongs to
    let found = false;
    for (const phase of DAILY_SEQUENCE) {
      if ((DAILY_TASKS_SEED[phase] || []).some(t => t.id === task.id)) {
        if (!grouped[phase]) grouped[phase] = [];
        grouped[phase].push(task);
        found = true;
        break;
      }
    }
    if (!found) {
      if (!grouped['Other']) grouped['Other'] = [];
      grouped['Other'].push(task);
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: 700, margin: '0 auto' }}>
      {/* Header stats */}
      <Panel style={{ padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 4 }}>Today's Quest</p>
            <span className="mono" style={{ fontSize: 13, color: 'var(--gold)' }}>+{totalXp} XP earned</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold-bright)' }}>
              {doneTasks}<span style={{ fontSize: 14, color: 'var(--ink-faint)' }}>/{totalTasks}</span>
            </span>
          </div>
        </div>
        <PBar pct={totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0} height={7} />
      </Panel>

      {/* Tab row */}
      <div className="tabrow" style={{ marginTop: 0, marginBottom: 16 }}>
        <button className={`tab ${tab === 'daily' ? 'tab-active' : ''}`} onClick={() => setTab('daily')}>
          📋 Daily Tasks ({doneTasks}/{totalTasks})
        </button>
        <button className={`tab ${tab === 'weekly' ? 'tab-active' : ''}`} onClick={() => setTab('weekly')}>
          📅 Weekly ({doneWeekly}/{totalWeekly})
        </button>
      </div>

      {tab === 'daily' && (
        <div>
          <MorningProgressBanner checklist={checklist} />

          {DAILY_SEQUENCE.map(phase => {
            const tasks = grouped[phase] || [];
            if (tasks.length === 0) return null;
            const phaseDone = tasks.filter(t => t.done).length;
            return (
              <Panel key={phase} style={{ padding: '14px 18px', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p className="eyebrow">{phase}</p>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{phaseDone}/{tasks.length}</span>
                </div>
                {tasks.map(t => (
                  <DailyTaskRow key={t.id} task={t} onToggle={onDailyToggle} />
                ))}
              </Panel>
            );
          })}

          {/* Custom / rolled tasks */}
          {(custom.length > 0 || checklist.daily.some(t => t.rolledFrom)) && (
            <Panel style={{ padding: '14px 18px', marginBottom: 12 }}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>Additional Tasks</p>
              {checklist.daily.filter(t => t.rolledFrom || (!allSeedIds.has(t.id) && !t.rolledFrom)).map(t => (
                <DailyTaskRow key={t.id} task={t} onToggle={onDailyToggle} onDelete={onDailyDelete} />
              ))}
            </Panel>
          )}

          <Panel style={{ padding: '14px 18px' }}>
            <p className="eyebrow" style={{ marginBottom: 10 }}>Add Custom Task</p>
            <AddRow onAdd={onDailyAdd} />
          </Panel>
        </div>
      )}

      {tab === 'weekly' && (
        <Panel style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p className="eyebrow">Week of {weekStartStr()}</p>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{doneWeekly}/{totalWeekly} complete</span>
          </div>
          <PBar pct={totalWeekly ? Math.round(doneWeekly / totalWeekly * 100) : 0} height={5} style={{ marginBottom: 14 }} />
          {weekly.weekly.map(t => (
            <div key={t.id} className="dtask-row">
              <button
                className={`chk ${t.done ? 'chk-done' : ''}`}
                style={{ width: 22, height: 22, flexShrink: 0, borderRadius: '50%' }}
                onClick={() => onWeeklyToggle(t.id)}
              >
                {t.done && (
                  <svg width={12} height={12} viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="rgba(0,0,0,0.7)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span style={{ flex: 1, fontSize: 14, color: t.done ? 'var(--ink-faint)' : 'var(--ink)', textDecoration: t.done ? 'line-through' : 'none' }}>
                {t.label}
              </span>
              <span className="mono" style={{ fontSize: 11, color: t.done ? 'var(--gold)' : 'var(--ink-faint)' }}>+{t.xp}</span>
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}
