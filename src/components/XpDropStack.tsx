import { useEffect, useState } from 'react';
import { QuestFX } from '../core/sfx';

interface Drop {
  id: number;
  label: string;
  xp: number;
}

let dropCounter = 0;

export default function XpDropStack() {
  const [drops, setDrops] = useState<Drop[]>([]);

  useEffect(() => {
    const unsub = QuestFX.subscribe((label, xp) => {
      const id = ++dropCounter;
      setDrops(d => [...d, { id, label, xp }]);
      setTimeout(() => {
        setDrops(d => d.filter(x => x.id !== id));
      }, 1600);
    });
    return unsub;
  }, []);

  if (drops.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: 80, right: 20, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {drops.map(d => (
        <div key={d.id} className="xp-drop mono" style={{ position: 'relative', right: 'auto' }}>
          +{d.xp} XP
        </div>
      ))}
    </div>
  );
}
