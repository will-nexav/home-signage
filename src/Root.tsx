import { useState } from 'react';
import App from './App';
import GymApp from './gym/GymApp';

const SWITCH_KEY = 'active_app';
type Which = 'gym' | 'quest';

export default function Root() {
  const [which, setWhich] = useState<Which>(() => (localStorage.getItem(SWITCH_KEY) as Which) || 'gym');

  function go(w: Which) {
    localStorage.setItem(SWITCH_KEY, w);
    setWhich(w);
  }

  return (
    <>
      {which === 'gym' ? <GymApp /> : <App />}

      {/* tiny corner switch — both apps live during the fork-then-merge phase */}
      <button
        onClick={() => go(which === 'gym' ? 'quest' : 'gym')}
        title={which === 'gym' ? 'Open QuestLog' : 'Open Iron Log'}
        style={{
          position: 'fixed', bottom: 14, left: 14, zIndex: 200,
          border: '1px solid rgba(201,168,107,0.3)', background: 'rgba(8,6,4,0.85)',
          color: 'var(--ink-faint)', borderRadius: 100, padding: '6px 13px',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: 'pointer',
          backdropFilter: 'blur(6px)',
        }}
      >
        {which === 'gym' ? '⚔️ Iron Log · → QuestLog' : '🏰 QuestLog · → Iron Log'}
      </button>
    </>
  );
}
