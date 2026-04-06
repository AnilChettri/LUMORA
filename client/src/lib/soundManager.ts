/**
 * Sound/Audio Utilities for Lumi App
 * Provides sound effects and background music management
 */

interface AudioConfig {
  volume?: number;
  loop?: boolean;
  rate?: number;
}

class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 0.7;
  private soundsEnabled: boolean = true;
  private currentMusic: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== "undefined" && window.AudioContext) {
      try {
        this.audioContext = new window.AudioContext();
      } catch (e) {
        console.warn("AudioContext not available");
      }
    }
  }

  /**
   * Play a simple beep sound (for games, interactions)
   */
  playBeep(frequency: number = 440, duration: number = 200) {
    if (!this.soundsEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration / 1000
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    } catch (e) {
      console.warn("Could not play beep:", e);
    }
  }

  /**
   * Play success sound (higher pitch)
   */
  playSuccess() {
    this.playBeep(800, 200);
    setTimeout(() => this.playBeep(1000, 200), 150);
  }

  /**
   * Play error sound (lower pitch)
   */
  playError() {
    this.playBeep(300, 300);
  }

  /**
   * Play click sound
   */
  playClick() {
    this.playBeep(600, 100);
  }

  /**
   * Play breathing guide sound (gentle bell)
   */
  playBreatheIn() {
    this.playBeep(528, 250); // Healing frequency
  }

  playBreatheOut() {
    this.playBeep(440, 250);
  }

  /**
   * Load and play background music
   */
  async playBackgroundMusic(
    audioPath: string,
    config: AudioConfig = {}
  ): Promise<HTMLAudioElement | null> {
    try {
      // Stop current music if playing
      this.stopBackgroundMusic();

      const audio = new Audio(audioPath);
      audio.loop = config.loop ?? true;
      audio.volume = (config.volume ?? 0.5) * this.masterVolume;
      audio.playbackRate = config.rate ?? 1;

      await audio.play();
      this.currentMusic = audio;
      return audio;
    } catch (e) {
      console.warn("Could not play background music:", e);
      return null;
    }
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume = this.masterVolume;
    }
  }

  /**
   * Toggle sounds on/off
   */
  setSoundsEnabled(enabled: boolean) {
    this.soundsEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.masterVolume;
  }

  /**
   * Resume audio context if suspended
   */
  resumeAudioContext() {
    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume();
    }
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

/**
 * Game Sound Effects Library
 */
export const gameSounds = {
  correctMatch: () => soundManager.playSuccess(),
  wrongMatch: () => soundManager.playError(),
  gameStart: () => soundManager.playBeep(800, 100),
  gameOver: () => {
    soundManager.playBeep(400, 300);
    setTimeout(() => soundManager.playBeep(300, 300), 150);
  },
  bubbleHit: () => soundManager.playClick(),
  levelUp: () => {
    soundManager.playBeep(800, 150);
    setTimeout(() => soundManager.playBeep(1000, 150), 100);
    setTimeout(() => soundManager.playBeep(1200, 200), 200);
  },
};

/**
 * Meditation Sound Effects
 */
export const meditationSounds = {
  breatheIn: () => soundManager.playBreatheIn(),
  breatheOut: () => soundManager.playBreatheOut(),
  mindfulnessChime: () => soundManager.playBeep(528, 400),
};

/**
 * Ambient Background Music Pool
 */
export const ambientTracks = {
  calming: "/sounds/ambient-calm.mp3",
  focus: "/sounds/ambient-focus.mp3",
  nature: "/sounds/ambient-nature.mp3",
  sleep: "/sounds/ambient-sleep.mp3",
};
