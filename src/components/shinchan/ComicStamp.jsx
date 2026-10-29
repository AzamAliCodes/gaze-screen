import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * Comic-style Neo-Brutalist Stamp Badge
 * Creates a playful, tactile seal of approval / microcopy tag.
 */
export default function ComicStamp({
  text,
  subtext,
  rotate = -3,
  color = '#EF4444', // Red default (Shinchan shirt)
  bgColor = '#FEF2F2',
  borderColor = '#121826',
  size = 'md',
  className = '',
  style = {},
}) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;

  const pad = size === 'sm' ? '3px 8px' : '5px 12px';
  const fontSize = size === 'sm' ? '0.68rem' : '0.78rem';

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: rotate + 2 }}
      transition={{ type: 'spring', stiffness: 350, damping: 15 }}
      className={`comic-stamp ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: pad,
        background: bgColor,
        border: `2px dashed ${borderColor}`,
        borderRadius: '4px',
        boxShadow: '2.5px 2.5px 0px #121826',
        transform: `rotate(${rotate}deg)`,
        userSelect: 'none',
        pointerEvents: 'none',
        ...style,
      }}
      aria-hidden="true"
    >
      <span
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize,
          fontWeight: 900,
          color,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          lineHeight: 1.1,
          textAlign: 'center',
        }}
      >
        {text}
      </span>
      {subtext && (
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.6rem',
            fontWeight: 700,
            color: '#121826',
            letterSpacing: '0.05em',
            marginTop: 2,
            opacity: 0.85,
          }}
        >
          {subtext}
        </span>
      )}
    </motion.div>
  );
}
