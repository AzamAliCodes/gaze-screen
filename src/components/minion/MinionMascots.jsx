import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Curated authentic Minion mascot assets with responsive sizing & sharp dropshadows.
 * Only rendered into the DOM when Minion theme is active (Zero unused asset downloads).
 */

export function HeroStuartMascot({ size = 280, className = '', style = {}, alt = 'Stuart Minion in Gru Overalls' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/hero-stuart.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 6px 0px rgba(18, 24, 38, 0.35))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function FlyingSuperMinion({ size = 260, className = '', style = {}, alt = 'Flying Superhero Minion with Cape' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/flying-super-minion.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(5px 7px 0px rgba(18, 24, 38, 0.38))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function CornerPeekingMinion({ size = 320, className = '', style = {}, alt = 'Minion peeking up at gaze target' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/corner-peeking-minion.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 6px 0px rgba(18, 24, 38, 0.32))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function ScientistMinion({ size = 200, className = '', style = {}, alt = 'Scientist Professor Minion' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/scientist-minion.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 5px 0px rgba(18, 24, 38, 0.32))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function CelebratingBob({ size = 220, className = '', style = {}, alt = 'Celebrating Bob Minion with hands raised' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/celebrating-bob.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 6px 0px rgba(18, 24, 38, 0.32))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function GuitarStuart({ size = 220, className = '', style = {}, alt = 'Stuart playing guitar' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/guitar-stuart.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 6px 0px rgba(18, 24, 38, 0.35))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function WavingStuart({ size = 180, className = '', style = {}, alt = 'Stuart Minion waving' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/waving-stuart.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(3px 5px 0px rgba(18, 24, 38, 0.28))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function RunningTourist({ size = 180, className = '', style = {}, alt = 'Minion running in tourist floral shirt' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/running-tourist.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 5px 0px rgba(18, 24, 38, 0.32))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function AdoringBob({ size = 160, className = '', style = {}, alt = 'Bob Minion adoring hands clasped' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/adoring-bob.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(3px 4px 0px rgba(18, 24, 38, 0.3))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function BananaEvilDuo({ size = 260, className = '', style = {}, alt = 'Minion offering banana to purple evil minion' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/banana-evil-duo.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 6px 0px rgba(18, 24, 38, 0.32))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function GazeShiftMinion({ size = 220, className = '', style = {}, alt = 'Minion eyes darting sideways' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/gaze-shift-minion.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 5px 0px rgba(18, 24, 38, 0.32))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function ActionClawsMinion({ size = 150, className = '', style = {}, alt = 'Wolverine action claws minion' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/action-claws-minion.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(3px 4px 0px rgba(18, 24, 38, 0.35))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function CaptainMinion({ size = 200, className = '', style = {}, alt = 'Captain shield minion' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/captain-minion.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 5px 0px rgba(18, 24, 38, 0.32))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function BananaItem({ size = 80, className = '', style = {}, alt = 'Banana icon' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/banana-item.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(2px 3px 0px rgba(18, 24, 38, 0.3))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function MinionGoggleEye({ size = 64, className = '', style = {}, alt = 'Minion Metallic Goggle Eye' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/minion-goggle-eye.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(2px 3px 0px rgba(18, 24, 38, 0.35))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function LaptopMinion({ size = 180, className = '', style = {}, alt = 'Yellow Minion working on laptop' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/laptop-minion.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 6px 0px rgba(18, 24, 38, 0.35))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function TrioBananaMinions({ size = 220, className = '', style = {}, alt = 'Kevin, Bob and Stuart Minions with Banana' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/trio-banana-minions.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 6px 0px rgba(18, 24, 38, 0.28))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function HappyDaveMinion({ size = 200, className = '', style = {}, alt = 'Happy Dave Minion celebrating' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/happy-dave-minion.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 6px 0px rgba(18, 24, 38, 0.28))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function HolePeekingMinion({ size = 210, className = '', style = {}, alt = 'Minion peeking out from hole' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/hole-peeking-minion.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 6px 0px rgba(18, 24, 38, 0.28))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function BobCarMinion({ size = 150, className = '', style = {}, alt = 'Bob Minion in toy car' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/bob-car-minion.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(3px 4px 0px rgba(18, 24, 38, 0.26))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function StewartActionMinion({ size = 180, className = '', style = {}, alt = 'Stewart Minion in Action' }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/stewart-action-minion.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none minion-mascot ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 6px 0px rgba(18, 24, 38, 0.28))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function DrivingMinionScooter({ size = 56, duration = 12, className = '', style = {} }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <>
      <style>{`
        @keyframes drive-minion-scooter-around-box {
          0% {
            top: 0%;
            left: 0%;
            transform: translate(-46%, -98%) rotate(0deg);
          }
          28% {
            top: 0%;
            left: 100%;
            transform: translate(-46%, -98%) rotate(0deg);
          }
          32% {
            top: 0%;
            left: 100%;
            transform: translate(-34%, -76%) rotate(90deg);
          }
          48% {
            top: 100%;
            left: 100%;
            transform: translate(-34%, -76%) rotate(90deg);
          }
          52% {
            top: 100%;
            left: 100%;
            transform: translate(-46%, -84%) rotate(180deg);
          }
          78% {
            top: 100%;
            left: 0%;
            transform: translate(-46%, -84%) rotate(180deg);
          }
          82% {
            top: 100%;
            left: 0%;
            transform: translate(-57%, -92%) rotate(270deg);
          }
          96% {
            top: 0%;
            left: 0%;
            transform: translate(-57%, -92%) rotate(270deg);
          }
          100% {
            top: 0%;
            left: 0%;
            transform: translate(-46%, -98%) rotate(360deg);
          }
        }
      `}</style>
      <div
        aria-hidden="true"
        className={`pointer-events-none select-none z-20 minion-scooter-container ${className}`}
        style={{
          position: 'absolute',
          transformOrigin: '46% 92%',
          animation: `drive-minion-scooter-around-box ${duration}s linear infinite`,
          willChange: 'top, left, transform',
          ...style,
        }}
      >
        <img
          src="/assets/minion/minion-scooter.png"
          alt="Minions driving scooter"
          style={{
            width: typeof size === 'number' ? `${size}px` : size,
            height: 'auto',
            transform: 'scaleX(-1)',
            filter: 'drop-shadow(0px 2px 3px rgba(18, 24, 38, 0.22))',
            display: 'block',
          }}
          loading="lazy"
          decoding="async"
        />
      </div>
    </>
  );
}

export function MinionLogo({ size = 36, className = '', style = {} }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <img
      src="/assets/minion/icon.svg"
      alt="Minion Goggle Eye Logo"
      width={size}
      height={size}
      className={`pointer-events-none select-none ${className}`}
      style={{
        width: size,
        height: size,
        filter: 'drop-shadow(2px 2px 0px var(--ink))',
        ...style,
      }}
    />
  );
}

export function MinionBgPattern({ opacity = 0.26, zoom = '100% auto', className = '', style = {}, fixed = false }) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;
  return (
    <div
      aria-hidden="true"
      className={`minion-bg-pattern pointer-events-none select-none ${className}`}
      style={{
        position: fixed ? 'fixed' : 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: fixed ? '100vw' : '100%',
        height: fixed ? '100vh' : '100%',
        zIndex: 0,
        opacity,
        pointerEvents: 'none',
        backgroundImage: "url('/assets/minion/minion-bg-pattern.svg')",
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center top',
        backgroundSize: zoom,
        ...style,
      }}
    />
  );
}
