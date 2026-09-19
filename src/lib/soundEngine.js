/**
 * GazeScreen ADHD Relief Soundtrack & Audio Engine
 * Features the custom-extracted ADHD Deep Focus & Relief melody soundtrack (/audio/adhd_focus.mp3)
 * with instant user-gesture unlocking, cross-browser autoplay handling, and smooth fade transitions.
 */

class SoundEngine {
  constructor() {
    this.audioUrl = '/audio/adhd_focus.mp3';
    this.audioEl = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.isBlocked = false;
    this.volume = 0.85; // Optimal listening volume for ADHD focus
    this.stateListeners = new Set();
    this.ctx = null;
  }

  // Subscribe to playback state changes
  subscribe(listener) {
    this.stateListeners.add(listener);
    // Initial call
    listener(this.getState());
    return () => this.stateListeners.delete(listener);
  }

  getState() {
    return {
      isPlaying: this.isPlaying && (this.audioEl ? !this.audioEl.paused : false),
      isMuted: this.isMuted,
      isBlocked: this.isBlocked,
      isRunning: this.isPlaying && !this.isBlocked && (this.audioEl ? !this.audioEl.paused : false),
    };
  }

  notify() {
    const state = this.getState();
    this.stateListeners.forEach((fn) => {
      try {
        fn(state);
      } catch (e) {
        console.warn('[SoundEngine] Listener error:', e);
      }
    });
  }

  // Initialize HTML5 Audio element
  initAudio() {
    if (this.audioEl || typeof Audio === 'undefined') return;

    try {
      this.audioEl = new Audio(this.audioUrl);
      this.audioEl.loop = true;
      this.audioEl.preload = 'auto';
      this.audioEl.volume = this.isMuted ? 0 : this.volume;
      this.audioEl.muted = this.isMuted;

      this.audioEl.addEventListener('playing', () => {
        this.isPlaying = true;
        this.isBlocked = false;
        this.notify();
      });

      this.audioEl.addEventListener('pause', () => {
        this.notify();
      });

      this.audioEl.addEventListener('error', (err) => {
        console.warn('[SoundEngine] Audio element error:', err);
      });
    } catch (e) {
      console.warn('[SoundEngine] Could not initialize Audio element:', e);
    }
  }

  // Pre-load audio during calibration click
  prepareAudio() {
    this.initAudio();
    if (this.audioEl) {
      this.audioEl.load();
    }
  }

  // Resume or start audio on any user gesture
  resumeAudio() {
    this.initAudio();
    if (!this.audioEl) return;

    if (this.isPlaying && this.audioEl.paused && !this.isMuted) {
      this.audioEl.play().then(() => {
        this.isBlocked = false;
        this.notify();
      }).catch((err) => {
        console.warn('[SoundEngine] play error:', err);
      });
    }
  }

  // Backwards-compatible alias
  resumeContext() {
    this.resumeAudio();
  }

  // Check if audio is currently playing
  isAudioRunning() {
    return this.isPlaying && !this.isBlocked && (this.audioEl ? !this.audioEl.paused : false);
  }

  // Start the ADHD Relief focus music
  startAudio() {
    this.initAudio();
    this.isPlaying = true;

    if (!this.audioEl) return;

    this.audioEl.currentTime = 0;
    this.audioEl.volume = this.isMuted ? 0 : this.volume;
    this.audioEl.muted = this.isMuted;

    const playPromise = this.audioEl.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isBlocked = false;
          this.notify();
        })
        .catch(() => {
          // Autoplay restricted by browser until user gesture
          this.isBlocked = true;
          this.notify();
        });
    }
  }

  // Backwards-compatible alias
  startMelody() {
    this.startAudio();
  }

  // Stop the music cleanly
  stopAudio() {
    this.isPlaying = false;
    this.isBlocked = false;
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
    }
    this.notify();
  }

  // Backwards-compatible alias
  stopMelody() {
    this.stopAudio();
  }

  // Smooth completion fade-out
  playCompletionFanfare() {
    if (!this.audioEl) return;

    let currentVol = this.audioEl.volume;
    const fadeTimer = setInterval(() => {
      currentVol = Math.max(0, currentVol - 0.15);
      if (this.audioEl) {
        this.audioEl.volume = currentVol;
      }
      if (currentVol <= 0) {
        clearInterval(fadeTimer);
        this.stopAudio();
      }
    }, 60);
  }

  // Immediate audible test tone / preview
  playTestTone() {
    this.initAudio();
    if (!this.audioEl) return;

    this.isMuted = false;
    this.audioEl.muted = false;
    this.audioEl.volume = this.volume;
    this.audioEl.play().then(() => {
      this.isPlaying = true;
      this.isBlocked = false;
      this.notify();
    }).catch(() => {});
  }

  // Phase transition and blink handlers
  setPhase() {}
  playPhaseChime() {}
  playBlinkChime() {}

  // Toggle Mute / Unmute
  toggleMute() {
    this.initAudio();
    this.isMuted = !this.isMuted;

    if (this.audioEl) {
      this.audioEl.muted = this.isMuted;
      this.audioEl.volume = this.isMuted ? 0 : this.volume;

      if (!this.isMuted && this.audioEl.paused && this.isPlaying) {
        this.audioEl.play().then(() => {
          this.isBlocked = false;
          this.notify();
        }).catch(() => {});
      }
    }

    this.notify();
    return this.isMuted;
  }

  // Adjust volume
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioEl && !this.isMuted) {
      this.audioEl.volume = this.volume;
    }
  }
}

// Singleton instance
const soundEngine = new SoundEngine();
export default soundEngine;
