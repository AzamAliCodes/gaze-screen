import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Authentic Shinchan mascot assets extracted directly from
 * https://recruitment.githubsrmist.in/
 */

export function FlyingMascot({ size = 260, className = '', style = {}, alt = 'Flying Action Kamen Shinchan' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/flying-mascot.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 6px 0px rgba(18, 24, 38, 0.4))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function ActionPunchMascot({ size = 200, className = '', style = {}, alt = 'Action Punch Shinchan' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/action-punch-mascot.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 6px 0px rgba(18, 24, 38, 0.4))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}


export function OperationsLeadMascot({ size = 120, className = '', style = {}, alt = 'Shinchan in business suit' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/operations-lead.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
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

export function CrayonCreatorMascot({ size = 120, className = '', style = {}, alt = 'Shinchan with crayon' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/crayon-creator.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
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

export function RolePigMascot({ size = 130, className = '', style = {}, alt = 'Buriburizaemon pig mascot' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/role-pig.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
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

export function KantamRoboMascot({ size = 220, className = '', style = {}, alt = 'Kantam Robo' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/kantam-full.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(5px 7px 0px rgba(18, 24, 38, 0.35))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function ActionKamenMascot({ size = 180, className = '', style = {}, alt = 'Action Kamen Superhero' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/char-action-kamen.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
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


export function MisaeMotherMascot({ size = 150, className = '', style = {}, alt = "Misae Nohara (Shinchan's Mother)" }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/misae-mother.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
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


export function ShiroShinchanMascot({ size = 140, className = '', style = {}, alt = 'Shinchan with Shiro the puppy' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/shiro-shinchan.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
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


export function ShinchanLetterMascot({ size = 180, className = '', style = {}, alt = 'Shinchan running with letter and Shiro' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/shinchan-letter-shiro.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
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

export function ShinchanHeadBalanceMascot({ size = 180, className = '', style = {}, alt = 'Shinchan balancing Shiro on head' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/shinchan-waving.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
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

export function ShinchanBackpackMascot({ size = 180, className = '', style = {}, alt = 'Shinchan with school backpack' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/shinchan-backpack.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
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

export function ShinchanLogo({ size = 44, className = '', style = {}, alt = 'Shinchan Avatar' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) {
    return (
      <div
        className={`clinical-logo-badge ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: '2px solid var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--yellow-400)',
          boxShadow: '2.5px 2.5px 0px var(--ink)',
          borderRadius: '3px',
          flexShrink: 0,
          ...style,
        }}
      >
        <svg width={Math.round(size * 0.55)} height={Math.round(size * 0.55)} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" fill="var(--ink)" />
        </svg>
      </div>
    );
  }
  return (
    <img
      src="/assets/shinchan/shinchan-avatar.png"
      alt={alt}
      width={size}
      height={size}
      className={`object-contain select-none bg-amber-300 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        border: '2px solid #121826',
        backgroundColor: '#FFE853',
        boxShadow: '2px 2px 0px #121826',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

/**
 * Halftone Screentone background pattern from recruitment.githubsrmist.in
 */
export function ComicBgPattern({ variant = 'doodle', opacity = 0.28, className = '', style = {}, fixed = false }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  const isDoodle = variant === 'doodle';
  const bgImg = isDoodle
    ? "url('/assets/shinchan/icon.svg')"
    : "url('/assets/shinchan/comic-bg-pattern.png')";

  return (
    <div
      className={`comic-bg-pattern ${className}`}
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
        backgroundImage: bgImg,
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center top',
        backgroundSize: isDoodle ? '100% auto' : '160px 160px',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function BumblebeeMascot({ size = 180, className = '', style = {}, alt = 'Shinchan in bumblebee costume' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/char-bee.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
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

export function PartyShinchanMascot({ size = 170, className = '', style = {}, alt = 'Shinchan peace sign mascot with bowtie' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/party-shinchan.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(4px 6px 0px rgba(18, 24, 38, 0.30))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function ShinchanShiroRelaxMascot({ size = 110, className = '', style = {}, alt = 'Shinchan and Shiro relaxing together' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/shinchan-shiro-relax.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(3px 4px 0px rgba(18, 24, 38, 0.22))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function RobotDadFamilyMascot({ size = 260, className = '', style = {}, alt = 'Robot Dad Hiroshi with Shinchan, Misae, Himawari and Shiro' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/robot-dad-family.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        filter: 'drop-shadow(5px 7px 0px rgba(18, 24, 38, 0.28))',
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

export function LaptopCoderMascot({ size = 180, className = '', style = {}, alt = 'Shinchan with laptop' }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <img
      src="/assets/shinchan/char-laptop.png"
      alt={alt}
      width={size}
      className={`object-contain pointer-events-none select-none ${className}`}
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

export function DrivingPixelCar({ size = 56, duration = 12, className = '', style = {} }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;
  return (
    <>
      <style>{`
        @keyframes drive-around-box {
          0% {
            top: 0%;
            left: 0%;
            transform: translate(-50%, -82%) scaleX(-1) rotate(0deg);
          }
          28% {
            top: 0%;
            left: 100%;
            transform: translate(-50%, -82%) scaleX(-1) rotate(0deg);
          }
          32% {
            top: 0%;
            left: 100%;
            transform: translate(-18%, -50%) scaleX(-1) rotate(-90deg);
          }
          48% {
            top: 100%;
            left: 100%;
            transform: translate(-18%, -50%) scaleX(-1) rotate(-90deg);
          }
          52% {
            top: 100%;
            left: 100%;
            transform: translate(-50%, -18%) scaleX(-1) rotate(-180deg);
          }
          78% {
            top: 100%;
            left: 0%;
            transform: translate(-50%, -18%) scaleX(-1) rotate(-180deg);
          }
          82% {
            top: 100%;
            left: 0%;
            transform: translate(-82%, -50%) scaleX(-1) rotate(-270deg);
          }
          96% {
            top: 0%;
            left: 0%;
            transform: translate(-82%, -50%) scaleX(-1) rotate(-270deg);
          }
          100% {
            top: 0%;
            left: 0%;
            transform: translate(-50%, -82%) scaleX(-1) rotate(-360deg);
          }
        }
      `}</style>
      <img
        src="/assets/shinchan/char-pixel-car.png"
        alt=""
        aria-hidden="true"
        className={`pointer-events-none select-none z-20 ${className}`}
        style={{
          position: 'absolute',
          width: typeof size === 'number' ? `${size}px` : size,
          height: 'auto',
          animation: `drive-around-box ${duration}s linear infinite`,
          willChange: 'top, left, transform',
          ...style,
        }}
        loading="lazy"
        decoding="async"
      />
    </>
  );
}
