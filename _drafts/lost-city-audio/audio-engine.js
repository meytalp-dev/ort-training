/**
 * העיר האבודה — Procedural Audio Engine
 * Complete Web Audio API system: ambients, SFX, adaptive music, mobile handling.
 * Zero audio files. Paste-ready for any HTML/JS browser game.
 *
 * Usage:
 *   const audio = new AudioManager();
 *   document.addEventListener('click', () => audio.init(), { once: true });
 *   audio.playAmbient('city');
 *   audio.playEffect('buttonTap');
 *   audio.setTrust(0.7);
 */

// ---------------------------------------------------------------------------
// AUDIO MANAGER — single entry-point class
// ---------------------------------------------------------------------------
class AudioManager {
  constructor() {
    this._ctx = null;
    this._master = null;         // master gain
    this._ambientBus = null;     // ambient submix
    this._sfxBus = null;         // sfx submix
    this._musicBus = null;       // adaptive music submix
    this._duckGain = null;       // ducking node (sits before master)

    this._activeAmbient = null;  // current ambient scene name
    this._ambientNodes = [];     // nodes to disconnect on scene change
    this._musicNodes = [];       // adaptive music nodes
    this._trust = 0.5;           // 0 = hostile, 1 = warm
    this._muted = false;
    this._initialized = false;
    this._disposed = false;

    // Restore mute preference
    try {
      this._muted = localStorage.getItem('lostcity_muted') === '1';
    } catch (_) { /* localStorage unavailable */ }

    // Visibility handling — pause/resume on background
    this._onVisibility = this._onVisibilityChange.bind(this);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this._onVisibility);
    }
  }

  // -----------------------------------------------------------------------
  // INIT — must be called from a user gesture (click / tap / keydown)
  // -----------------------------------------------------------------------
  init() {
    if (this._initialized) return Promise.resolve();

    // Feature detection
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      console.warn('[AudioManager] Web Audio API not supported');
      this._initialized = true; // prevent repeated attempts
      return Promise.resolve();
    }

    this._ctx = new AC({ latencyHint: 'playback', sampleRate: 44100 });

    // iOS / Safari unlock: resume context then play a silent buffer
    const unlock = () => {
      if (this._ctx.state === 'suspended') {
        return this._ctx.resume().then(() => {
          const buf = this._ctx.createBuffer(1, 1, 22050);
          const src = this._ctx.createBufferSource();
          src.buffer = buf;
          src.connect(this._ctx.destination);
          src.start(0);
        });
      }
      return Promise.resolve();
    };

    // Build signal chain: sources -> buses -> duckGain -> master -> destination
    this._master = this._ctx.createGain();
    this._master.gain.value = this._muted ? 0 : 1;
    this._master.connect(this._ctx.destination);

    this._duckGain = this._ctx.createGain();
    this._duckGain.gain.value = 1;
    this._duckGain.connect(this._master);

    this._ambientBus = this._ctx.createGain();
    this._ambientBus.gain.value = 0.35;
    this._ambientBus.connect(this._duckGain);

    this._musicBus = this._ctx.createGain();
    this._musicBus.gain.value = 0.25;
    this._musicBus.connect(this._duckGain);

    this._sfxBus = this._ctx.createGain();
    this._sfxBus.gain.value = 0.6;
    this._sfxBus.connect(this._master); // SFX bypass ducking

    this._initialized = true;

    return unlock().then(() => {
      this._startAdaptiveMusic();
    });
  }

  // -----------------------------------------------------------------------
  // AMBIENT SOUNDSCAPES
  // -----------------------------------------------------------------------
  /**
   * @param {'city'|'dialogue'|'tension'|'garden'} scene
   * @param {number} [fadeDuration=2] crossfade seconds
   */
  playAmbient(scene, fadeDuration = 2) {
    if (!this._ctx || this._activeAmbient === scene) return;
    const now = this._ctx.currentTime;

    // Fade out existing ambient
    if (this._ambientNodes.length) {
      const oldGain = this._ambientBus.gain;
      oldGain.setValueAtTime(oldGain.value, now);
      oldGain.linearRampToValueAtTime(0, now + fadeDuration * 0.5);

      const oldNodes = this._ambientNodes.slice();
      setTimeout(() => {
        oldNodes.forEach(n => { try { n.stop?.(); n.disconnect(); } catch (_) {} });
      }, fadeDuration * 600);
      this._ambientNodes = [];
    }

    // Build new ambient
    const nodes = this._buildAmbient(scene);
    this._ambientNodes = nodes;
    this._activeAmbient = scene;

    // Fade in
    this._ambientBus.gain.setValueAtTime(0, now + fadeDuration * 0.4);
    this._ambientBus.gain.linearRampToValueAtTime(0.35, now + fadeDuration);
  }

  _buildAmbient(scene) {
    switch (scene) {
      case 'city':      return this._ambientCity();
      case 'dialogue':  return this._ambientDialogue();
      case 'tension':   return this._ambientTension();
      case 'garden':    return this._ambientGarden();
      default:          return this._ambientCity();
    }
  }

  // -- City ambient: low drone + filtered noise + occasional wind gusts ----
  _ambientCity() {
    const ctx = this._ctx;
    const nodes = [];

    // 1) Deep drone — two detuned sines
    const drone1 = ctx.createOscillator();
    drone1.type = 'sine';
    drone1.frequency.value = 55; // A1
    const drone1Gain = ctx.createGain();
    drone1Gain.gain.value = 0.4;
    drone1.connect(drone1Gain).connect(this._ambientBus);
    drone1.start();
    nodes.push(drone1);

    const drone2 = ctx.createOscillator();
    drone2.type = 'sine';
    drone2.frequency.value = 55.8; // slightly detuned — beating
    const drone2Gain = ctx.createGain();
    drone2Gain.gain.value = 0.35;
    drone2.connect(drone2Gain).connect(this._ambientBus);
    drone2.start();
    nodes.push(drone2);

    // 2) Distant echoes — filtered noise bursts on a timer
    const echoNoise = this._createNoiseSource();
    const echoBPF = ctx.createBiquadFilter();
    echoBPF.type = 'bandpass';
    echoBPF.frequency.value = 800;
    echoBPF.Q.value = 8;
    const echoGain = ctx.createGain();
    echoGain.gain.value = 0;
    echoNoise.connect(echoBPF).connect(echoGain).connect(this._ambientBus);
    echoNoise.start();
    nodes.push(echoNoise);

    // Random echo bursts
    this._scheduleRandom(() => {
      if (this._activeAmbient !== 'city') return false;
      const now = ctx.currentTime;
      const freq = 400 + Math.random() * 1200;
      echoBPF.frequency.setValueAtTime(freq, now);
      echoGain.gain.setValueAtTime(0, now);
      echoGain.gain.linearRampToValueAtTime(0.15, now + 0.1);
      echoGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + Math.random() * 1.5);
      return true;
    }, 3000, 8000);

    // 3) Wind — filtered noise with slow LFO
    const windNoise = this._createNoiseSource();
    const windLPF = ctx.createBiquadFilter();
    windLPF.type = 'lowpass';
    windLPF.frequency.value = 400;
    windLPF.Q.value = 1;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.12;
    windNoise.connect(windLPF).connect(windGain).connect(this._ambientBus);
    windNoise.start();
    nodes.push(windNoise);

    // Wind gusts via slow LFO on filter frequency
    const windLFO = ctx.createOscillator();
    windLFO.type = 'sine';
    windLFO.frequency.value = 0.08; // very slow
    const windLFOGain = ctx.createGain();
    windLFOGain.gain.value = 300;
    windLFO.connect(windLFOGain).connect(windLPF.frequency);
    windLFO.start();
    nodes.push(windLFO);

    return nodes;
  }

  // -- Dialogue ambient: very soft version, almost subliminal ---------------
  _ambientDialogue() {
    const ctx = this._ctx;
    const nodes = [];

    // Single soft drone
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 65; // C2ish
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.15;
    drone.connect(droneGain).connect(this._ambientBus);
    drone.start();
    nodes.push(drone);

    // Very soft filtered noise — like air conditioning
    const noise = this._createNoiseSource();
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 200;
    lpf.Q.value = 0.5;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.06;
    noise.connect(lpf).connect(noiseGain).connect(this._ambientBus);
    noise.start();
    nodes.push(noise);

    return nodes;
  }

  // -- Tension ambient: dissonant intervals, pulsing noise ------------------
  _ambientTension() {
    const ctx = this._ctx;
    const nodes = [];

    // Tritone drone — unsettling
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 73.42; // D2
    const osc1G = ctx.createGain();
    osc1G.gain.value = 0.12;
    const osc1F = ctx.createBiquadFilter();
    osc1F.type = 'lowpass';
    osc1F.frequency.value = 300;
    osc1.connect(osc1F).connect(osc1G).connect(this._ambientBus);
    osc1.start();
    nodes.push(osc1);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.value = 103.83; // Ab2 — tritone from D
    const osc2G = ctx.createGain();
    osc2G.gain.value = 0.1;
    const osc2F = ctx.createBiquadFilter();
    osc2F.type = 'lowpass';
    osc2F.frequency.value = 280;
    osc2.connect(osc2F).connect(osc2G).connect(this._ambientBus);
    osc2.start();
    nodes.push(osc2);

    // Pulsing noise — heartbeat-like
    const noise = this._createNoiseSource();
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 100;
    bpf.Q.value = 3;
    const pulseGain = ctx.createGain();
    pulseGain.gain.value = 0;
    noise.connect(bpf).connect(pulseGain).connect(this._ambientBus);
    noise.start();
    nodes.push(noise);

    // Pulse LFO — ~1.2 Hz (heartbeat tempo)
    const pulseLFO = ctx.createOscillator();
    pulseLFO.type = 'sine';
    pulseLFO.frequency.value = 1.2;
    const pulseLFOGain = ctx.createGain();
    pulseLFOGain.gain.value = 0.2;
    // Offset so gain oscillates 0..0.4
    const pulseDC = ctx.createConstantSource();
    pulseDC.offset.value = 0.2;
    pulseLFO.connect(pulseLFOGain).connect(pulseGain.gain);
    pulseDC.connect(pulseGain.gain);
    pulseLFO.start();
    pulseDC.start();
    nodes.push(pulseLFO, pulseDC);

    // High dissonant whistle — occasional
    this._scheduleRandom(() => {
      if (this._activeAmbient !== 'tension') return false;
      const now = ctx.currentTime;
      const whistleOsc = ctx.createOscillator();
      whistleOsc.type = 'sine';
      whistleOsc.frequency.value = 1800 + Math.random() * 600;
      const wG = ctx.createGain();
      wG.gain.setValueAtTime(0, now);
      wG.gain.linearRampToValueAtTime(0.04, now + 0.3);
      wG.gain.exponentialRampToValueAtTime(0.001, now + 2);
      whistleOsc.connect(wG).connect(this._ambientBus);
      whistleOsc.start(now);
      whistleOsc.stop(now + 2.5);
      return true;
    }, 4000, 10000);

    return nodes;
  }

  // -- Garden ambient: warm pads, gentle nature tones -----------------------
  _ambientGarden() {
    const ctx = this._ctx;
    const nodes = [];

    // Warm major pad — C major triad in sines, very soft
    const padFreqs = [130.81, 164.81, 196]; // C3, E3, G3
    padFreqs.forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.08;
      osc.connect(g).connect(this._ambientBus);
      osc.start();
      nodes.push(osc);
    });

    // Soft noise — like distant water / leaves
    const noise = this._createNoiseSource();
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 600;
    lpf.Q.value = 0.7;
    const nG = ctx.createGain();
    nG.gain.value = 0.05;
    noise.connect(lpf).connect(nG).connect(this._ambientBus);
    noise.start();
    nodes.push(noise);

    // Bird-like chirps — short sine blips at high frequencies
    this._scheduleRandom(() => {
      if (this._activeAmbient !== 'garden') return false;
      const now = ctx.currentTime;
      const bird = ctx.createOscillator();
      bird.type = 'sine';
      const baseF = 1800 + Math.random() * 1400;
      bird.frequency.setValueAtTime(baseF, now);
      bird.frequency.linearRampToValueAtTime(baseF * 1.3, now + 0.06);
      bird.frequency.linearRampToValueAtTime(baseF * 0.9, now + 0.12);
      const bG = ctx.createGain();
      bG.gain.setValueAtTime(0, now);
      bG.gain.linearRampToValueAtTime(0.06, now + 0.02);
      bG.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      bird.connect(bG).connect(this._ambientBus);
      bird.start(now);
      bird.stop(now + 0.25);
      return true;
    }, 2500, 7000);

    return nodes;
  }

  // -----------------------------------------------------------------------
  // UI SOUND EFFECTS
  // -----------------------------------------------------------------------
  /**
   * @param {'buttonTap'|'choiceSelected'|'trustUp'|'trustDown'|
   *          'remember'|'shardCollected'|'chapterComplete'|
   *          'speechBubble'|'silenceWarning'} name
   */
  playEffect(name) {
    if (!this._ctx) return;
    const fn = this['_sfx_' + name];
    if (fn) fn.call(this);
  }

  // -- Button tap: soft click, 50ms ----------------------------------------
  _sfx_buttonTap() {
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(g).connect(this._sfxBus);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // -- Choice selected: confirmation blip, 100ms ---------------------------
  _sfx_choiceSelected() {
    const ctx = this._ctx;
    const now = ctx.currentTime;
    // Two quick tones
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(900, now + 0.05);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, now);
    g.gain.setValueAtTime(0.2, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(g).connect(this._sfxBus);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // -- Trust increase: ascending tone, 200ms --------------------------------
  _sfx_trustUp() {
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, now);
    g.gain.setValueAtTime(0.25, now + 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(g).connect(this._sfxBus);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // -- Trust decrease: descending tone, 200ms --------------------------------
  _sfx_trustDown() {
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, now);
    g.gain.setValueAtTime(0.25, now + 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(g).connect(this._sfxBus);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // -- "Remember this" notification: subtle chime, 300ms --------------------
  _sfx_remember() {
    const ctx = this._ctx;
    const now = ctx.currentTime;
    // Two harmonically-related sines for a bell-like chime
    [1, 2.4].forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 1200 * ratio;
      const g = ctx.createGain();
      const vol = i === 0 ? 0.2 : 0.08;
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(g).connect(this._sfxBus);
      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  // -- Shard collected: crystalline sparkle, 400ms --------------------------
  _sfx_shardCollected() {
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const freqs = [1400, 1800, 2200, 2800]; // rising sparkle
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = ctx.createGain();
      const offset = i * 0.07;
      g.gain.setValueAtTime(0, now + offset);
      g.gain.linearRampToValueAtTime(0.15, now + offset + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.25);
      osc.connect(g).connect(this._sfxBus);
      osc.start(now + offset);
      osc.stop(now + offset + 0.3);
    });
  }

  // -- Chapter complete: 3-note ascending chord, 800ms ----------------------
  _sfx_chapterComplete() {
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const g = ctx.createGain();
      const onset = i * 0.2;
      g.gain.setValueAtTime(0, now + onset);
      g.gain.linearRampToValueAtTime(0.2, now + onset + 0.05);
      g.gain.setValueAtTime(0.18, now + onset + 0.3);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(g).connect(this._sfxBus);
      osc.start(now + onset);
      osc.stop(now + 0.85);
    });
  }

  // -- NPC speech bubble appear: soft pop, 80ms -----------------------------
  _sfx_speechBubble() {
    const ctx = this._ctx;
    const now = ctx.currentTime;
    // Short noise burst through bandpass — "pop"
    const noise = this._createNoiseSource();
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 1000;
    bpf.Q.value = 5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    noise.connect(bpf).connect(g).connect(this._sfxBus);
    noise.start(now);
    noise.stop(now + 0.1);
  }

  // -- Silence timeout warning: pulsing tone that speeds up -----------------
  _sfx_silenceWarning() {
    const ctx = this._ctx;
    const now = ctx.currentTime;
    // 3-second pulsing tone, pulse rate accelerates
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 440;
    const g = ctx.createGain();
    g.gain.value = 0;
    osc.connect(g).connect(this._sfxBus);
    osc.start(now);

    // Generate accelerating pulse envelope
    const totalDuration = 3;
    const steps = 12;
    let t = 0;
    for (let i = 0; i < steps; i++) {
      const interval = 0.5 - (i / steps) * 0.35; // 0.5s -> 0.15s
      g.gain.setValueAtTime(0.15, now + t);
      g.gain.setValueAtTime(0, now + t + interval * 0.5);
      t += interval;
      if (t > totalDuration) break;
    }
    g.gain.setValueAtTime(0, now + totalDuration);
    osc.stop(now + totalDuration + 0.1);
  }

  // -----------------------------------------------------------------------
  // ADAPTIVE MUSIC SYSTEM
  // -----------------------------------------------------------------------
  _startAdaptiveMusic() {
    const ctx = this._ctx;

    // Base layer: filtered noise pad (always running)
    const noise = this._createNoiseSource();
    const noiseLPF = ctx.createBiquadFilter();
    noiseLPF.type = 'lowpass';
    noiseLPF.frequency.value = 300;
    noiseLPF.Q.value = 0.5;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.08;
    noise.connect(noiseLPF).connect(noiseGain).connect(this._musicBus);
    noise.start();
    this._musicNodes.push(noise);
    this._musicNoiseFilter = noiseLPF;

    // Harmonic pad — 4 oscillators whose frequencies shift with trust
    this._musicPadOscs = [];
    this._musicPadGains = [];
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 130; // placeholder, set by _applyTrust
      const g = ctx.createGain();
      g.gain.value = 0.06;
      osc.connect(g).connect(this._musicBus);
      osc.start();
      this._musicPadOscs.push(osc);
      this._musicPadGains.push(g);
      this._musicNodes.push(osc);
    }

    this._applyTrust(this._trust);
  }

  /**
   * @param {number} value 0..1 (0 = hostile/minor, 1 = warm/major)
   */
  setTrust(value) {
    this._trust = Math.max(0, Math.min(1, value));
    if (this._ctx) this._applyTrust(this._trust);
  }

  _applyTrust(t) {
    if (!this._musicPadOscs) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const ramp = 1.5; // seconds to glide

    // Root note — lower trust = lower root
    const rootHz = 110 + t * 30; // 110 Hz (A2) at 0, 140 Hz at 1

    // Chord intervals — morph from minor/dissonant to major/warm
    // t=0: root, minor 3rd, dim 5th, minor 7th  (dark, tense)
    // t=1: root, major 3rd, perfect 5th, octave  (warm, resolved)
    const intervals = [
      1,                                    // root
      Math.pow(2, (3 + t) / 12),           // 3 semitones (m3) -> 4 (M3)
      Math.pow(2, (6 + t) / 12),           // 6 semitones (tritone) -> 7 (P5)
      Math.pow(2, (10 + 2 * t) / 12),     // 10 semitones (m7) -> 12 (octave)
    ];

    this._musicPadOscs.forEach((osc, i) => {
      osc.frequency.setValueAtTime(osc.frequency.value, now);
      osc.frequency.linearRampToValueAtTime(rootHz * intervals[i], now + ramp);
    });

    // Noise filter opens up at high trust (warmer), closes at low trust (darker)
    if (this._musicNoiseFilter) {
      this._musicNoiseFilter.frequency.setValueAtTime(
        this._musicNoiseFilter.frequency.value, now
      );
      this._musicNoiseFilter.frequency.linearRampToValueAtTime(
        200 + t * 400, now + ramp
      );
    }
  }

  // -----------------------------------------------------------------------
  // DUCKING (for dialogue)
  // -----------------------------------------------------------------------
  duck(fadeSec = 0.5) {
    if (!this._ctx) return;
    const now = this._ctx.currentTime;
    this._duckGain.gain.setValueAtTime(this._duckGain.gain.value, now);
    this._duckGain.gain.linearRampToValueAtTime(0.25, now + fadeSec);
  }

  unduck(fadeSec = 0.8) {
    if (!this._ctx) return;
    const now = this._ctx.currentTime;
    this._duckGain.gain.setValueAtTime(this._duckGain.gain.value, now);
    this._duckGain.gain.linearRampToValueAtTime(1, now + fadeSec);
  }

  // -----------------------------------------------------------------------
  // MUTE / UNMUTE
  // -----------------------------------------------------------------------
  mute() {
    this._muted = true;
    this._persistMute();
    if (this._master) {
      const now = this._ctx.currentTime;
      this._master.gain.setValueAtTime(this._master.gain.value, now);
      this._master.gain.linearRampToValueAtTime(0, now + 0.15);
    }
  }

  unmute() {
    this._muted = false;
    this._persistMute();
    if (this._master) {
      const now = this._ctx.currentTime;
      this._master.gain.setValueAtTime(this._master.gain.value, now);
      this._master.gain.linearRampToValueAtTime(1, now + 0.15);
    }
  }

  toggleMute() {
    this._muted ? this.unmute() : this.mute();
    return this._muted;
  }

  get isMuted() { return this._muted; }

  _persistMute() {
    try { localStorage.setItem('lostcity_muted', this._muted ? '1' : '0'); } catch (_) {}
  }

  // -----------------------------------------------------------------------
  // MOBILE / VISIBILITY HANDLING
  // -----------------------------------------------------------------------
  _onVisibilityChange() {
    if (!this._ctx) return;
    if (document.hidden) {
      this._ctx.suspend().catch(() => {});
    } else {
      this._ctx.resume().catch(() => {});
    }
  }

  // -----------------------------------------------------------------------
  // CLEANUP
  // -----------------------------------------------------------------------
  dispose() {
    this._disposed = true;
    document.removeEventListener('visibilitychange', this._onVisibility);
    this._ambientNodes.forEach(n => { try { n.stop?.(); n.disconnect(); } catch (_) {} });
    this._musicNodes.forEach(n => { try { n.stop?.(); n.disconnect(); } catch (_) {} });
    if (this._ctx && this._ctx.state !== 'closed') {
      this._ctx.close().catch(() => {});
    }
  }

  // -----------------------------------------------------------------------
  // UTILITIES
  // -----------------------------------------------------------------------

  /** Create a white noise AudioBufferSourceNode (looping) */
  _createNoiseSource() {
    const ctx = this._ctx;
    // Reuse shared buffer if already created
    if (!this._noiseBuffer) {
      const len = ctx.sampleRate * 2; // 2 seconds of noise
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this._noiseBuffer = buf;
    }
    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer;
    src.loop = true;
    return src;
  }

  /**
   * Schedule a callback at random intervals. The callback returns false to stop.
   * @param {Function} fn — called each tick; return false to cancel
   * @param {number} minMs
   * @param {number} maxMs
   */
  _scheduleRandom(fn, minMs, maxMs) {
    const tick = () => {
      if (this._disposed) return;
      const cont = fn();
      if (cont === false) return;
      const delay = minMs + Math.random() * (maxMs - minMs);
      setTimeout(tick, delay);
    };
    setTimeout(tick, minMs + Math.random() * (maxMs - minMs));
  }
}

// ---------------------------------------------------------------------------
// EXPORT — works as ES module or global
// ---------------------------------------------------------------------------
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AudioManager };
}
