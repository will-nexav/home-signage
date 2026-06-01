
import Check from './Check';
import type { DailyTask } from '../core/types';

interface DailyTaskRowProps {
  task: DailyTask;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function DailyTaskRow({ task, onToggle, onDelete }: DailyTaskRowProps) {
  return (
    <div className="dtask-row">
      <Check done={task.done} size={20} onClick={() => onToggle(task.id)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          color: task.done ? 'var(--ink-faint)' : 'var(--ink)',
          textDecoration: task.done ? 'line-through' : 'none',
          lineHeight: 1.4,
        }}>
          {task.label}
        </div>
        {task.rolledFrom && !task.done && (
          <span className="tag tag-roll" style={{ marginTop: 2, display: 'inline-block' }}>rolled</span>
        )}
      </div>
      <span className="mono" style={{ fontSize: 11, color: task.done ? 'var(--gold)' : 'var(--ink-faint)', flexShrink: 0 }}>
        +{task.xp}
      </span>
      {onDelete && (
        <button className="row-act row-act-del" onClick={() => onDelete(task.id)} title="Delete">✕</button>
      )}
    </div>
  );
}
