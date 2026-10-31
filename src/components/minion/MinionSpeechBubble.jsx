import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function MinionSpeechBubble({
  text = 'Bello! Kampai!',
  subtext = '',
  direction = 'bottom-left', // 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'left' | 'right'
  className = '',
  style = {},
  variant = 'yellow', // 'yellow' | 'blue'
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;

  const bg = variant === 'blue' ? '#245B9E' : '#FED41E';
  const color = variant === 'blue' ? '#ffffff' : '#111827';

  const padSizes = {
    sm: '5px 10px',
    md: '8px 14px',
    lg: '12px 18px',
  };

  const fontSizes = {
    sm: '0.72rem',
    md: '0.8rem',
    lg: '0.92rem',
  };

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className={`minion-speech-bubble ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        background: bg,
        color: color,
        border: '2.5px solid var(--ink)',
        boxShadow: size === 'sm' ? '2.5px 2.5px 0px var(--ink)' : '3.5px 3.5px 0px var(--ink)',
        borderRadius: size === 'sm' ? '12px' : '16px',
        padding: padSizes[size] || padSizes.md,
        fontFamily: 'var(--font-mono)',
        fontSize: fontSizes[size] || fontSizes.md,
        fontWeight: 800,
        userSelect: 'none',
        zIndex: 10,
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>{text}</span>
      </div>
      {subtext && (
        <div style={{ fontSize: size === 'sm' ? '0.6rem' : '0.65rem', fontWeight: 700, opacity: 0.82, marginTop: 2 }}>
          {subtext}
        </div>
      )}

      {/* Pointer Tail */}
      <div
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          borderStyle: 'solid',
          ...(direction === 'bottom-left' && {
            bottom: -11,
            left: 18,
            borderWidth: '11px 9px 0 0',
            borderColor: `${bg} transparent transparent transparent`,
          }),
          ...(direction === 'bottom-right' && {
            bottom: -11,
            right: 18,
            borderWidth: '11px 0 0 9px',
            borderColor: `${bg} transparent transparent transparent`,
          }),
          ...(direction === 'top-left' && {
            top: -11,
            left: 18,
            borderWidth: '0 9px 11px 0',
            borderColor: `transparent transparent ${bg} transparent`,
          }),
          ...(direction === 'top-right' && {
            top: -11,
            right: 18,
            borderWidth: '0 0 11px 9px',
            borderColor: `transparent transparent ${bg} transparent`,
          }),
          ...(direction === 'left' && {
            left: -11,
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: '7px 11px 7px 0',
            borderColor: `transparent ${bg} transparent transparent`,
          }),
          ...(direction === 'right' && {
            right: -11,
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: '7px 0 7px 11px',
            borderColor: `transparent transparent transparent ${bg}`,
          }),
        }}
      />
    </motion.div>
  );
}
