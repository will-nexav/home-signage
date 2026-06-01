import { useState, useRef } from 'react';

interface EditTextProps {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

export default function EditText({ value, onChange, style, className }: EditTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commit() {
    if (draft.trim()) onChange(draft.trim());
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
        className="tome-input"
        style={{ fontSize: 'inherit', ...style }}
        autoFocus
      />
    );
  }

  return (
    <span className={`text-edit ${className || ''}`} onClick={startEdit} style={style} title="Click to edit">
      {value}
    </span>
  );
}
