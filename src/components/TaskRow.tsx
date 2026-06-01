
import Check from './Check';
import type { Task } from '../core/types';

interface TaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
}

export default function TaskRow({ task, onToggle }: TaskRowProps) {
  return (
    <div className="task-row">
      <Check done={task.done} onClick={() => onToggle(task.id)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          color: task.done ? 'var(--ink-faint)' : 'var(--ink)',
          textDecoration: task.done ? 'line-through' : 'none',
          lineHeight: 1.4,
          transition: 'color .2s',
        }}>
          {task.label}
        </div>
      </div>
      <span className="mono" style={{ fontSize: 11, color: task.done ? 'var(--gold)' : 'var(--ink-faint)', flexShrink: 0 }}>
        +{task.xp}
      </span>
    </div>
  );
}
