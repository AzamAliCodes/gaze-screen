import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '', style = {} }) {
  const { isShinchanTheme, toggleShinchanTheme } = useTheme();

  return (
    <button
      onClick={toggleShinchanTheme}
      type="button"
      className={`theme-toggle-btn ${className}`}
      aria-label={`Toggle Shinchan mode (currently ${isShinchanTheme ? 'ON' : 'OFF'})`}
      title={isShinchanTheme ? 'Turn Shinchan mode OFF' : 'Turn Shinchan mode ON'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        padding: '4px 8px 4px 11px',
        background: isShinchanTheme ? '#FFF7ED' : '#F8FAFC',
        border: '2px solid var(--ink)',
        borderRadius: '24px',
        boxShadow: '2px 2px 0px var(--ink)',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.72rem',
        fontWeight: 800,
        color: isShinchanTheme ? 'var(--orange-600)' : 'var(--ink)',
        userSelect: 'none',
        transition: 'background 0.15s ease, color 0.15s ease',
        ...style,
      }}
    >
      <span style={{ letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
        SHINCHAN MODE
      </span>

      {/* Switch track with ON / OFF text built inside the button itself */}
      <div
        style={{
          width: 52,
          height: 22,
          borderRadius: 11,
          background: isShinchanTheme ? 'var(--orange-500)' : '#64748b',
          border: '1.5px solid var(--ink)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          overflow: 'hidden',
          transition: 'background 0.2s ease',
          flexShrink: 0,
        }}
      >
        {/* ON text inside the switch track */}
        <motion.span
          initial={false}
          animate={{
            opacity: isShinchanTheme ? 1 : 0,
            x: isShinchanTheme ? 0 : -6,
          }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'absolute',
            left: 7,
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.62rem',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '0.04em',
            lineHeight: 1,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          ON
        </motion.span>

        {/* OFF text inside the switch track */}
        <motion.span
          initial={false}
          animate={{
            opacity: !isShinchanTheme ? 1 : 0,
            x: !isShinchanTheme ? 0 : 6,
          }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'absolute',
            right: 6,
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.56rem',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '0.04em',
            lineHeight: 1,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          OFF
        </motion.span>

        {/* Sliding circle thumb knob */}
        <motion.div
          initial={false}
          animate={{ x: isShinchanTheme ? 30 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute',
            top: 2,
            left: 1,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#ffffff',
            border: '1.5px solid var(--ink)',
            boxShadow: '1px 1px 0px var(--ink)',
          }}
        />
      </div>
    </button>
  );
}
