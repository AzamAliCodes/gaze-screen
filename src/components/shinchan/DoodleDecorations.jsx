import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Hand-drawn & comic doodle decorative accents
 * Vector SVGs designed to integrate into Neo-Brutalism layouts.
 */

// 1. Hand Drawn Curved Arrow pointing right/down or left
export function HandDrawnArrow({
  direction = 'right-down', // 'right-down' | 'left-down' | 'up-right'
  color = '#121826',
  width = 54,
  height = 36,
  style = {},
  className = '',
}) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 60 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none', ...style }}
      aria-hidden="true"
    >
      {direction === 'right-down' && (
        <>
          <path
            d="M6 8 C22 4 44 14 48 30"
            stroke={color}
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M38 28 L49 32 L49 20"
            stroke={color}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      )}
      {direction === 'left-down' && (
        <>
          <path
            d="M54 8 C38 4 16 14 12 30"
            stroke={color}
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M22 28 L11 32 L11 20"
            stroke={color}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      )}
      {direction === 'up-right' && (
        <>
          <path
            d="M10 32 C18 18 36 12 50 10"
            stroke={color}
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M38 6 L52 10 L44 20"
            stroke={color}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}

// 2. Playful Sketch Underline (wavy highlighter/marker effect)
export function SketchUnderline({
  color = '#FACC15',
  width = '100%',
  height = 10,
  style = {},
  className = '',
}) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', pointerEvents: 'none', ...style }}
      aria-hidden="true"
    >
      <path
        d="M2 8 Q 50 2, 100 7 T 198 6"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 3. Comic Sparkle Cluster
export function SparkleCluster({
  size = 28,
  color = '#FACC15',
  style = {},
  className = '',
}) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none', filter: 'drop-shadow(1.5px 1.5px 0px #121826)', ...style }}
      aria-hidden="true"
    >
      {/* Primary sparkle */}
      <path
        d="M16 2 Q 16 16, 30 16 Q 16 16, 16 30 Q 16 16, 2 16 Q 16 16, 16 2 Z"
        fill={color}
        stroke="#121826"
        strokeWidth="1.5"
      />
      {/* Mini secondary sparkle */}
      <path
        d="M26 4 Q 26 8, 30 8 Q 26 8, 26 12 Q 26 8, 22 8 Q 26 8, 26 4 Z"
        fill="#FFFFFF"
        stroke="#121826"
        strokeWidth="1.2"
      />
    </svg>
  );
}

// 4. Shinchan Iconic Eyebrow Doodle Motif (used in pill tags or cards)
export function EyebrowMotif({ size = 24, color = '#121826', style = {} }) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;

  return (
    <svg
      width={size}
      height={Math.round(size * 0.45)}
      viewBox="0 0 32 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      aria-hidden="true"
    >
      <path d="M2 9 C8 3 14 4 16 8" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M18 7 C22 2 28 3 31 7" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}
