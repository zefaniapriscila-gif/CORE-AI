/**
 * SoundEngine - Web Audio API Synthesizer
 * Produces low, satisfying, and crunchy tactile sound effects for hover and click.
 */

type SoundListener = (muted: boolean) => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;
  private listeners: Set<SoundListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('core_ai_sound_muted');
      this.isMuted = saved === 'true';
    }
  }

  /**
   * Subscribe to sound mute state changes.
   */
  public subscribe(listener: SoundListener): () => void {
    this.listeners.add(listener);
    listener(this.isMuted);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.isMuted));
  }

  /**
   * Initialize or resume the Web Audio Context.
   */
  public initContext() {
    if (typeof window === 'undefined') return;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(
          this.isMuted ? 0 : 1,
          this.ctx.currentTime
        );
        this.masterGain.connect(this.ctx.destination);
        this.generateNoiseBuffer();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : 1,
        this.ctx.currentTime
      );
    }
  }

  /**
   * Pre-generates 0.5s of white noise for the tactile "crunchy" switch texture.
   */
  private generateNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.8;
    }
    this.noiseBuffer = buffer;
  }

  private getDestination(): AudioNode | null {
    if (!this.ctx) return null;
    return this.masterGain || this.ctx.destination;
  }

  /**
   * Plays a low, satisfying, crunchy HOVER sound effect.
   */
  public playHover() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const dest = this.getDestination();
    if (!dest) return;

    const now = this.ctx.currentTime;
    const pitchJitter = (Math.random() - 0.5) * 12;
    const startFreq = 160 + pitchJitter;
    const endFreq = 80 + pitchJitter / 2;

    // 1. Low Body Oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.035);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(480, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.04);

    // 2. Crunchy Noise Texture
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      noise.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1450 + pitchJitter * 10, now);
      noiseFilter.Q.setValueAtTime(3.8, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.002);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(dest);

      const offset = Math.random() * 0.2;
      noise.start(now, offset);
      noise.stop(now + 0.025);
    }
  }

  /**
   * Plays a low, satisfying, crunchy CLICK sound effect.
   */
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const dest = this.getDestination();
    if (!dest) return;

    const now = this.ctx.currentTime;
    const pitchJitter = (Math.random() - 0.5) * 20;

    // 1. Primary Low Body Oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(125 + pitchJitter, now);
    osc.frequency.exponentialRampToValueAtTime(36 + pitchJitter / 2, now + 0.05);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.34, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.055);

    // 2. Sub-Bass Thud
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(85, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.04);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.24, now + 0.002);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    subOsc.connect(subGain);
    subGain.connect(dest);

    subOsc.start(now);
    subOsc.stop(now + 0.05);

    // 3. Crunchy Mechanical Click Noise
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      noise.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1100 + pitchJitter * 8, now);
      noiseFilter.Q.setValueAtTime(2.6, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.16, now + 0.002);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(dest);

      const offset = Math.random() * 0.2;
      noise.start(now, offset);
      noise.stop(now + 0.035);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('core_ai_sound_muted', String(muted));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        muted ? 0 : 1,
        this.ctx.currentTime
      );
    }
    this.notifyListeners();
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    const nextState = !this.isMuted;
    this.setMuted(nextState);
    if (!nextState) {
      this.playClick();
    }
    return nextState;
  }
}

export const soundEngine = new SoundEngine();

/**
 * Check if a DOM node or any of its ancestors is an interactive element.
 */
export function findInteractiveElement(target: EventTarget | null): Element | null {
  if (!target || !(target instanceof Element)) return null;

  // Ignore elements marked with data-no-sound="true" or their children
  if (target.closest('[data-no-sound="true"]')) return null;

  const selector = [
    'button',
    'a',
    'input',
    'select',
    'textarea',
    '[role="button"]',
    '[role="tab"]',
    '[role="menuitem"]',
    '[role="option"]',
    '[role="checkbox"]',
    '[role="switch"]',
    '[tabindex]:not([tabindex="-1"])',
    '[data-sound]',
    '.cursor-pointer',
    '.interactive',
    'label',
    'summary',
  ].join(',');

  const closest = target.closest(selector);
  if (closest) return closest;

  // Also check if element has explicit cursor: pointer in inline or computed style
  try {
    const style = window.getComputedStyle(target);
    if (style.cursor === 'pointer') {
      return target;
    }
  } catch {
    // Ignore edge cases
  }

  return null;
}
