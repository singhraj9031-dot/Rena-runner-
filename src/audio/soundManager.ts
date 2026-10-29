/**
 * Procedural Web Audio Synthesizer for Rena Runner 3D
 * Zero external audio files, 100% procedural Web Audio oscillators.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  public sfxEnabled: boolean = true;
  public musicEnabled: boolean = true;
  private musicInterval: number | null = null;
  private musicStep: number = 0;
  private streakCounter: number = 0;
  private lastCoinTime: number = 0;

  constructor() {
    // Lazily init AudioContext on first user interaction
    const savedSfx = localStorage.getItem('rena_sfx_enabled');
    const savedMusic = localStorage.getItem('rena_music_enabled');
    if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
    if (savedMusic !== null) this.musicEnabled = savedMusic === 'true';
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSfx(enabled: boolean) {
    this.sfxEnabled = enabled;
    localStorage.setItem('rena_sfx_enabled', String(enabled));
  }

  public setMusic(enabled: boolean) {
    this.musicEnabled = enabled;
    localStorage.setItem('rena_music_enabled', String(enabled));
    if (!enabled) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  // --- Sound Effects ---

  public playCoinSound() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = performance.now();
    if (now - this.lastCoinTime < 800) {
      this.streakCounter = Math.min(this.streakCounter + 1, 12);
    } else {
      this.streakCounter = 0;
    }
    this.lastCoinTime = now;

    const baseFreq = 587.33; // D5
    const semitones = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28];
    const freq = baseFreq * Math.pow(2, semitones[this.streakCounter % semitones.length] / 12);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  public playJumpSound() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  public playSlideSound() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Filtered noise swoosh for slide
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.18);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  public playLaneSwitchSound() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  public playPowerUpSound() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const startTime = this.ctx!.currentTime + idx * 0.06;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.18);
    });
  }

  public playHighScoreFanfare() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Grand energetic fanfare: C5 -> E5 -> G5 -> C6 high flourish
    const chords = [
      { f: 523.25, t: 0.00, d: 0.12 },
      { f: 659.25, t: 0.10, d: 0.12 },
      { f: 783.99, t: 0.20, d: 0.14 },
      { f: 1046.50, t: 0.32, d: 0.45 },
    ];

    chords.forEach(c => {
      const startTime = this.ctx!.currentTime + c.t;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(c.f, startTime);

      // Low pass to soften square wave
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + c.d);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + c.d);
    });
  }

  public playCrashSound() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Heavy punch noise + low sub drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.36);
  }

  public playShieldBreakSound() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.29);
  }

  public playClickSound() {
    if (!this.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // --- Background Music: Energetic Subway Runner Groove ---

  public startMusic() {
    if (!this.musicEnabled) return;
    if (this.musicInterval !== null) return;
    this.initCtx();
    if (!this.ctx) return;

    // Tempo: ~132 BPM => 16th notes = ~114 ms
    const stepDuration = 114;
    const bassNotes = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
    const melodyNotes = [440, 0, 523.25, 0, 587.33, 659.25, 523.25, 0];

    this.musicStep = 0;
    this.musicInterval = window.setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;

      const time = this.ctx.currentTime;
      const step = this.musicStep % 16;
      const beat = step % 4;

      // 1. Kick on beat 0 and 2; Snare on beat 1 and 3
      if (beat === 0) {
        // Kick
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.07);
        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.08);
      } else if (beat === 2) {
        // Crisp snare tap
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, time);
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.06);
      }

      // 2. Bassline
      const bassFreq = bassNotes[Math.floor(step / 2) % bassNotes.length];
      if (bassFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, time);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, time);

        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.1);
      }

      // 3. Synth Arp / Melody
      const melodyFreq = melodyNotes[step % melodyNotes.length];
      if (melodyFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(melodyFreq, time);
        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.09);
      }

      this.musicStep++;
    }, stepDuration);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
