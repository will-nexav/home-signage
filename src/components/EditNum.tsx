import { useState, useRef } from 'react';

interface EditNumProps {
  value: number;
  onChange: (v: number) => void;
  style?: React.CSSProperties;
  className?: string;
  prefix?: string;
  suffix?: string;
  format?: (v: number) => string;
}

export default function EditNum({ value, onChange, style, className, prefix = '', suffix = '', format }: EditNumProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const display = format ? format(value) : `${prefix}${value.toLocaleString()}${suffix}`;

  function startEdit() {
    setDraft(String(value));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commit() {
    const n = parseFloat(draft.replace(/[^0-9.-]/g, ''));
    if (!isNaN(n)) onChange(n);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className="tome-input num-input"
        style={{ width: 100, padding: '2px 6px', fontSize: 'inherit', ...style }}
        autoFocus
      />
    );
  }

  return (
    <span className={`num-edit ${className || ''}`} onClick={startEdit} style={style} title="Click to edit">
      {display}
    </span>
  );
}
