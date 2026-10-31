import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function BananaStamp({
  label = 'BANANA APPROVED',
  sublabel = 'GRU LABS • 100% ON-DEVICE',
  variant = 'yellow', // 'yellow' | 'blue' | 'purple'
  rotation = -4,
  size = 'md',
  className = '',
  style = {},
}) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;

  const colorMap = {
    yellow: { bg: '#FED41E', text: '#111827', border: '#111827', accent: '#D97706' },
    blue: { bg: '#245B9E', text: '#FFFFFF', border: '#111827', accent: '#60A5FA' },
    purple: { bg: '#7C3AED', text: '#FFFFFF', border: '#111827', accent: '#C084FC' },
  };

  const scheme = colorMap[variant] || colorMap.yellow;
  const paddingMap = {
    sm: '4px 10px',
    md: '6px 14px',
    lg: '10px 20px',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, rotate: rotation }}
      animate={{ scale: 1, opacity: 1, rotate: rotation }}
      whileHover={{ scale: 1.06, rotate: rotation > 0 ? rotation + 3 : rotation - 3 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className={`minion-stamp ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: scheme.bg,
        color: scheme.text,
        border: `2.5px solid ${scheme.border}`,
        boxShadow: `3px 3px 0px ${scheme.border}`,
        borderRadius: '8px',
        padding: paddingMap[size] || paddingMap.md,
        userSelect: 'none',
        fontFamily: 'var(--font-mono)',
        textAlign: 'center',
        cursor: 'default',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: size === 'sm' ? '0.75rem' : '0.9rem' }}>⚡</span>
        <span
          style={{
            fontWeight: 900,
            fontSize: size === 'sm' ? '0.68rem' : size === 'lg' ? '0.95rem' : '0.8rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            lineHeight: 1.1,
          }}
        >
          {label}
        </span>
      </div>
      {sublabel && (
        <span
          style={{
            fontSize: size === 'sm' ? '0.55rem' : '0.62rem',
            fontWeight: 800,
            opacity: 0.85,
            letterSpacing: '0.04em',
            marginTop: 2,
          }}
        >
          {sublabel}
        </span>
      )}
    </motion.div>
  );
}
