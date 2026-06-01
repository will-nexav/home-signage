type QuestFXListener = (label: string, xp: number) => void;

class SFXSingleton {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
    }
    return this.ctx;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, gainVal: number) {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch { /* ignore */ }
  }

  complete() {
    try {
      const ctx = this.getCtx();
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.3, 0.15), i * 80);
      });
      void ctx;
    } catch { /* ignore */ }
  }

  levelUp() {
    try {
      const ctx = this.getCtx();
      const notes = [392, 494, 587, 784, 988];
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.5, 0.2), i * 100);
      });
      void ctx;
    } catch { /* ignore */ }
  }

  tick() {
    this.playTone(440, 'sine', 0.1, 0.08);
  }
}

export const SFX = new SFXSingleton();

class QuestFXPubSub {
  private listeners: QuestFXListener[] = [];

  subscribe(fn: QuestFXListener): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  emit(label: string, xp: number) {
    this.listeners.forEach(fn => fn(label, xp));
  }
}

export const QuestFX = new QuestFXPubSub();
