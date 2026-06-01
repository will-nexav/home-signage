import { useState } from 'react';
import TaskRow from './TaskRow';
import { grpStats } from '../core/engine';
import type { Category } from '../core/types';
import PBar from './PBar';
import { accent } from '../core/constants';

interface GroupBlockProps {
  group: Category['groups'][number];
  accentKey: string;
  onToggle: (taskId: string) => void;
}

export default function GroupBlock({ group, accentKey, onToggle }: GroupBlockProps) {
  const [open, setOpen] = useState(true);
  const stats = grpStats(group);
  const ac = accent(accentKey);

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', padding: '8px 0', cursor: 'pointer' }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ color: 'var(--ink-faint)', fontSize: 11 }}>{open ? '▼' : '▶'}</span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 700, color: ac.text, letterSpacing: '0.04em', flex: 1, textAlign: 'left' }}>
          {group.label}
        </span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
          {stats.done}/{stats.total}
        </span>
      </button>
      <PBar pct={stats.pct} bar={ac.bar} height={3} style={{ marginBottom: open ? 10 : 0 }} />
      {open && (
        <div style={{ paddingLeft: 4 }}>
          {group.tasks.map(task => (
            <TaskRow key={task.id} task={task} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}
