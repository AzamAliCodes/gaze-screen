import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STIMULUS_PHASES, TOTAL_STIMULUS_DURATION } from '../lib/stimulus';

/**
 * StimulusPlayer — drives the 60-second attention test.
 * Renders social vs. geometric animated scenes in-canvas.
 * Calls onPhaseChange(phase) and onComplete() at appropriate times.
 */
export default function StimulusPlayer({ active = false, onPhaseChange, onComplete, onProgress }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const elapsedRef = useRef(0);
  const phaseStartRef = useRef(Date.now());
  const phaseIdxRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    phaseStartRef.current = Date.now();
    phaseIdxRef.current = 0;
    elapsedRef.current = 0;
    setPhaseIdx(0);
    setElapsed(0);

    const tick = () => {
      const now = Date.now();
      const sincePhaseStart = now - phaseStartRef.current;
      const currentPhase = STIMULUS_PHASES[phaseIdxRef.current];

      elapsedRef.current += 50;
      setElapsed(elapsedRef.current);
      onProgress?.(Math.min(elapsedRef.current / TOTAL_STIMULUS_DURATION, 1));

      if (sincePhaseStart >= currentPhase.duration) {
        const nextIdx = phaseIdxRef.current + 1;
        if (nextIdx >= STIMULUS_PHASES.length) {
          onComplete?.();
          return;
        }
        phaseIdxRef.current = nextIdx;
        setPhaseIdx(nextIdx);
        phaseStartRef.current = Date.now();
        onPhaseChange?.(STIMULUS_PHASES[nextIdx]);
      }

      timerRef.current = setTimeout(tick, 50);
    };

    timerRef.current = setTimeout(tick, 50);
    onPhaseChange?.(STIMULUS_PHASES[0]);

    return () => clearTimeout(timerRef.current);
  }, [active]);

  const phase = STIMULUS_PHASES[phaseIdx] || STIMULUS_PHASES[0];
  const progress = Math.min(elapsed / TOTAL_STIMULUS_DURATION, 1);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#0a0a0a' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={phase.id}
          style={{ position: 'absolute', inset: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {phase.type === 'social' && <SocialScene phase={phase} />}
          {phase.type === 'geometric' && <GeometricScene phase={phase} />}
          {phase.type === 'instruction' && <IntroScene />}
          {phase.type === 'complete' && <CompleteScene />}
        </motion.div>
      </AnimatePresence>

      {/* Phase label overlay */}
      <div style={{
        position: 'absolute', top: 16, left: 16,
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(18, 24, 38, 0.88)',
        border: '1.5px solid rgba(255, 255, 255, 0.25)',
        borderRadius: '3px',
        padding: '5px 12px',
        backdropFilter: 'blur(8px)',
        zIndex: 20,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: phase.accentColor || 'var(--yellow-400)',
          boxShadow: `0 0 10px ${phase.accentColor || 'var(--yellow-400)'}`,
          display: 'inline-block',
        }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {phase.label}
        </span>
      </div>
    </div>
  );
}

/* ── Social Scene ─────────────────────────────────────────────── */
function SocialScene({ phase }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: `radial-gradient(ellipse at center, ${phase.bgColor || '#0a2e1a'} 0%, #050d08 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 32,
    }}>
      {/* Animated face */}
      <motion.div
        style={{ position: 'relative' }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Face circle */}
        <motion.div
          style={{
            width: 130, height: 130, borderRadius: '50%',
            background: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)',
            border: `4px solid ${phase.accentColor || '#22c55e'}`,
            boxShadow: `0 0 40px ${phase.accentColor || '#22c55e'}44`,
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          {/* Eyes */}
          <div style={{ display: 'flex', gap: 28, marginBottom: 10 }}>
            <AnimatedEye />
            <AnimatedEye />
          </div>
          {/* Smile */}
          <div style={{
            width: 50, height: 24,
            borderBottom: '4px solid #92400e',
            borderRadius: '0 0 40px 40px',
            marginTop: -4,
          }} />
        </motion.div>

        {/* Attention sparkles */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: 6, height: 6,
              background: phase.accentColor || '#22c55e',
              borderRadius: '50%',
              transformOrigin: `${70 + i * 5}px 0`,
            }}
            animate={{
              rotate: [angle, angle + 360],
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>

      {/* Two figures interacting */}
      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end' }}>
        <Figure color={phase.accentColor || '#38bdf8'} delay={0} />
        <Figure color="#a855f7" delay={0.5} mirror />
      </div>
    </div>
  );
}

function AnimatedEye() {
  return (
    <motion.div
      style={{
        width: 16, height: 16, borderRadius: '50%',
        background: '#1c1917',
        border: '2px solid #78350f',
        position: 'relative',
      }}
      animate={{ scaleY: [1, 0.15, 1] }}
      transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3.5 + Math.random() * 2 }}
    >
      <div style={{
        position: 'absolute', top: 3, left: 3,
        width: 5, height: 5, borderRadius: '50%', background: '#fff',
      }} />
    </motion.div>
  );
}

function Figure({ color, delay, mirror }) {
  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transform: mirror ? 'scaleX(-1)' : 'none' }}
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      {/* Head */}
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: color, border: '2px solid #fff2' }} />
      {/* Body */}
      <div style={{ width: 20, height: 40, background: color, opacity: 0.8 }} />
      {/* Arm reaching */}
      <motion.div
        style={{ width: 30, height: 4, background: color, originX: 0, position: 'absolute', top: 36, right: -14 }}
        animate={{ rotate: [0, -20, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay }}
      />
    </motion.div>
  );
}

/* ── Geometric Scene ─────────────────────────────────────────── */
function GeometricScene({ phase }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: `radial-gradient(ellipse at center, #0d1b2a 0%, #050a0f 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Rotating fractal-like shapes */}
      <div style={{ position: 'relative', width: 280, height: 280 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              inset: `${(i - 1) * 22}px`,
              border: `2px solid ${phase.accentColor || '#a3e635'}`,
              opacity: 1 - i * 0.12,
            }}
            animate={{ rotate: i % 2 === 0 ? [0, 360] : [360, 0] }}
            transition={{ duration: 4 + i * 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        {/* Center pulsing dot */}
        <motion.div
          style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 20, height: 20, borderRadius: '50%',
            background: phase.accentColor || '#a3e635',
            boxShadow: `0 0 30px ${phase.accentColor || '#a3e635'}`,
          }}
          animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Orbiting dots */}
        {[0, 72, 144, 216, 288].map((angle, idx) => (
          <motion.div
            key={idx}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 8, height: 8, borderRadius: '50%',
              background: phase.accentColor || '#a3e635',
              transformOrigin: '0 0',
            }}
            animate={{ rotate: [angle, angle + 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <div style={{ transform: 'translate(-4px, -70px) translateX(-50%)', width: 8, height: 8, borderRadius: '50%', background: phase.accentColor || '#a3e635', opacity: 0.6 }} />
          </motion.div>
        ))}
      </div>

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${phase.accentColor || '#a3e635'}11 1px, transparent 1px), linear-gradient(90deg, ${phase.accentColor || '#a3e635'}11 1px, transparent 1px)`,
        backgroundSize: '30px 30px',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

function IntroScene() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#0a0f1d',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20,
    }}>
      <motion.div
        style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--yellow-400)', letterSpacing: '0.15em' }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        CALIBRATING GAZE TRACKER…
      </motion.div>
      <div style={{ display: 'flex', gap: 10 }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--blue-500)' }}
            animate={{ scale: [0, 1, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

function CompleteScene() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#0a0f1d',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16,
    }}>
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        style={{
          width: 80, height: 80, borderRadius: '50%',
          border: '4px solid var(--orange-500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(249, 115, 22, 0.5)',
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--orange-500)" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#ffffff', fontSize: '1.1rem', letterSpacing: '0.12em' }}>
        SCAN PROTOCOL COMPLETE
      </div>
    </div>
  );
}
