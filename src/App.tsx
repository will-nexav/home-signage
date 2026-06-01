import { useState, useEffect } from 'react';
import Header from './components/Header';
import XpDropStack from './components/XpDropStack';
import LevelUpModal from './components/LevelUpModal';
import RewardShelf from './components/RewardShelf';
import HomeView from './views/HomeView';
import CategoryView from './views/CategoryView';
import StatsView from './views/StatsView';
import TodayView from './views/TodayView';
import OverviewView from './views/OverviewView';
import NetWorthView from './views/NetWorthView';
import HealthView from './views/HealthView';
import BusinessView from './views/BusinessView';
import {
  loadState, saveState, computeXp, getLevel,
  loadChecklist, saveChecklist, loadWeekly, saveWeekly,
  loadJSON, saveJSON, seedToState,
  NW_KEY, HEALTH_KEY, BIZ_KEY, NW_SEED, HEALTH_SEED, BIZ_SEED,
  todayStr,
} from './core/engine';
import { SFX, QuestFX } from './core/sfx';
import type { AppState, LevelInfo, NWState, HealthState, BizState, ChecklistState, WeeklyState, Reward } from './core/types';

let taskIdCounter = Date.now();
function genId() { return `custom-${++taskIdCounter}`; }

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [checklist, setChecklist] = useState<ChecklistState>(() => loadChecklist());
  const [weekly, setWeekly] = useState<WeeklyState>(() => loadWeekly());
  const [nw, setNw] = useState<NWState>(() => loadJSON(NW_KEY, NW_SEED));
  const [health, setHealth] = useState<HealthState>(() => loadJSON(HEALTH_KEY, HEALTH_SEED));
  const [biz, setBiz] = useState<BizState>(() => loadJSON(BIZ_KEY, BIZ_SEED));
  const [view, setView] = useState<string>('home');
  const [levelUpInfo, setLevelUpInfo] = useState<LevelInfo | null>(null);

  // Persist state
  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { saveChecklist(checklist); }, [checklist]);
  useEffect(() => { saveWeekly(weekly); }, [weekly]);
  useEffect(() => { saveJSON(NW_KEY, nw); }, [nw]);
  useEffect(() => { saveJSON(HEALTH_KEY, health); }, [health]);
  useEffect(() => { saveJSON(BIZ_KEY, biz); }, [biz]);


  function totalXp(cats: AppState['cats'], habits: AppState['habits']) {
    const taskXp = computeXp(cats);
    const habitXp = habits.reduce((s, h) => s + h.days.length * h.xp, 0);
    return taskXp + habitXp;
  }

  function handleTaskToggle(catId: string, taskId: string) {
    const oldLevel = state.level;
    setState(prev => {
      const newCats = prev.cats.map(cat => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          groups: cat.groups.map(grp => ({
            ...grp,
            tasks: grp.tasks.map(task => {
              if (task.id !== taskId) return task;
              const toggled = { ...task, done: !task.done };
              if (toggled.done) {
                SFX.complete();
                QuestFX.emit(task.label, task.xp);
              }
              return toggled;
            }),
          })),
        };
      });
      const newXp = totalXp(newCats, prev.habits);
      const newLevelInfo = getLevel(newXp);
      if (newLevelInfo.level > oldLevel) {
        setTimeout(() => { SFX.levelUp(); setLevelUpInfo(newLevelInfo); }, 50);
      }
      return { ...prev, cats: newCats, xp: newXp, level: newLevelInfo.level };
    });
  }

  function handleHabitToggle(habitId: string) {
    const today = todayStr();
    const oldLevel = state.level;
    setState(prev => {
      const newHabits = prev.habits.map(h => {
        if (h.id !== habitId) return h;
        const isDone = h.days.includes(today);
        const newDays = isDone ? h.days.filter(d => d !== today) : [...h.days, today];
        if (!isDone) {
          SFX.tick();
          QuestFX.emit(h.label, h.xp);
        }
        return { ...h, days: newDays };
      });
      const newXp = totalXp(prev.cats, newHabits);
      const newLevelInfo = getLevel(newXp);
      if (newLevelInfo.level > oldLevel) {
        setTimeout(() => { SFX.levelUp(); setLevelUpInfo(newLevelInfo); }, 50);
      }
      return { ...prev, habits: newHabits, xp: newXp, level: newLevelInfo.level };
    });
  }

  function handleLateSession(habitId: string) {
    const today = todayStr();
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => {
        if (h.id !== habitId) return h;
        const sessions = h.lateSessions || [];
        const isOn = sessions.includes(today);
        return { ...h, lateSessions: isOn ? sessions.filter(d => d !== today) : [...sessions, today] };
      }),
    }));
  }

  function handleDailyToggle(taskId: string) {
    setChecklist(prev => {
      const task = prev.daily.find(t => t.id === taskId);
      if (!task) return prev;
      const toggled = !task.done;
      if (toggled) {
        SFX.complete();
        QuestFX.emit(task.label, task.xp);
      }
      return {
        ...prev,
        daily: prev.daily.map(t => t.id === taskId ? { ...t, done: toggled } : t),
      };
    });
  }

  function handleDailyDelete(taskId: string) {
    setChecklist(prev => ({ ...prev, daily: prev.daily.filter(t => t.id !== taskId) }));
  }

  function handleDailyAdd(label: string, xp: number) {
    setChecklist(prev => ({
      ...prev,
      daily: [...prev.daily, { id: genId(), label, xp, done: false }],
    }));
  }

  function handleWeeklyToggle(taskId: string) {
    setWeekly(prev => {
      const task = prev.weekly.find(t => t.id === taskId);
      if (!task) return prev;
      const toggled = !task.done;
      if (toggled) {
        SFX.complete();
        QuestFX.emit(task.label, task.xp);
      }
      return {
        ...prev,
        weekly: prev.weekly.map(t => t.id === taskId ? { ...t, done: toggled } : t),
      };
    });
  }

  function handleRewardRedeem(r: Reward) {
    if (state.xp < r.xpCost) return;
    setState(prev => ({ ...prev, xp: prev.xp - r.xpCost }));
    alert(`🎉 Reward unlocked: ${r.icon} ${r.label}!`);
  }

  function handleNav(dest: string) {
    setView(dest);
  }

  function handleReset() {
    if (!window.confirm('Reset all quest data? This cannot be undone.')) return;
    const fresh = seedToState();
    setState(fresh);
    setView('home');
  }

  // Parse view
  let mainView = view;
  let catId = '';
  if (view.startsWith('category:')) {
    mainView = 'category';
    catId = view.replace('category:', '');
  }

  const cat = state.cats.find(c => c.id === catId);

  const topNavView = ['home', 'category'].includes(mainView) ? 'home'
    : mainView === 'today' ? 'today'
    : mainView === 'stats' ? 'stats'
    : ['overview', 'networth', 'health', 'business'].includes(mainView) ? 'overview'
    : mainView;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 40 }}>
      <Header xp={state.xp} level={state.level} onNav={handleNav} currentView={topNavView} />

      <div style={{ marginTop: 20 }}>
        {mainView === 'home' && (
          <HomeView
            state={state}
            onCatClick={id => setView('category:' + id)}
            onHabitToggle={handleHabitToggle}
            onLateSession={handleLateSession}
          />
        )}

        {mainView === 'category' && cat && (
          <CategoryView
            cat={cat}
            onToggle={taskId => handleTaskToggle(cat.id, taskId)}
            onBack={() => setView('home')}
          />
        )}

        {mainView === 'stats' && (
          <StatsView state={state} />
        )}

        {mainView === 'today' && (
          <TodayView
            checklist={checklist}
            weekly={weekly}
            onDailyToggle={handleDailyToggle}
            onDailyDelete={handleDailyDelete}
            onDailyAdd={handleDailyAdd}
            onWeeklyToggle={handleWeeklyToggle}
          />
        )}

        {mainView === 'overview' && (
          <OverviewView
            state={state}
            nw={nw}
            health={health}
            biz={biz}
            onNav={handleNav}
          />
        )}

        {mainView === 'networth' && (
          <NetWorthView state={nw} onChange={setNw} onBack={() => setView('overview')} />
        )}

        {mainView === 'health' && (
          <HealthView state={health} onChange={setHealth} onBack={() => setView('overview')} />
        )}

        {mainView === 'business' && (
          <BusinessView state={biz} onChange={setBiz} onBack={() => setView('overview')} />
        )}
      </div>

      {mainView === 'home' && (
        <RewardShelf xp={state.xp} onRedeem={handleRewardRedeem} />
      )}

      <div style={{ textAlign: 'center', marginTop: 30 }}>
        <button className="reset-link" onClick={handleReset}>reset all data</button>
      </div>

      <XpDropStack />

      {levelUpInfo && (
        <LevelUpModal levelInfo={levelUpInfo} onClose={() => setLevelUpInfo(null)} />
      )}
    </div>
  );
}
