import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * Comic Speech Bubble Component
 * Adapts to neo-brutalism with crisp ink borders and tactile offset shadows.
 */
export default function SpeechBubble({
  children,
  tail = 'bottom-left', // 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'left' | 'right'
  variant = 'yellow',    // 'yellow' | 'white' | 'orange' | 'blue' | 'pink' | 'green'
  size = 'md',          // 'sm' | 'md' | 'lg'
  animated = true,
  className = '',
  style = {},
}) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;

  const bgColors = {
    yellow: '#FEF9C3',
    white: '#FFFFFF',
    orange: '#FFEDD5',
    blue: '#DBEAFE',
    pink: '#FCE7F3',
    green: '#DCFCE7',
  };

  const padSizes = {
    sm: '6px 10px',
    md: '8px 14px',
    lg: '12px 18px',
  };

  const fontSizes = {
    sm: '0.72rem',
    md: '0.82rem',
    lg: '0.92rem',
  };

  const bg = bgColors[variant] || bgColors.yellow;

  // Tail positioning logic via border triangles
  const renderTail = () => {
    switch (tail) {
      case 'bottom-left':
        return (
          <div
            style={{
              position: 'absolute',
              bottom: -9,
              left: 18,
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '9px solid #121826',
              filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.15))',
            }}
          >
            {/* Inner fill */}
            <div
              style={{
                position: 'absolute',
                top: -11,
                left: -7,
                width: 0,
                height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '3px solid transparent',
                borderTop: `8px solid ${bg}`,
              }}
            />
          </div>
        );

      case 'bottom-right':
        return (
          <div
            style={{
              position: 'absolute',
              bottom: -9,
              right: 18,
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '9px solid #121826',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -11,
                right: -7,
                width: 0,
                height: 0,
                borderLeft: '3px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: `8px solid ${bg}`,
              }}
            />
          </div>
        );

      case 'left':
        return (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: -9,
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderRight: '9px solid #121826',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -5,
                left: 2,
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderRight: `7px solid ${bg}`,
              }}
            />
          </div>
        );

      case 'right':
        return (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: -9,
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderLeft: '9px solid #121826',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -5,
                right: 2,
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderLeft: `7px solid ${bg}`,
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const bubbleContent = (
    <div
      className={`comic-speech-bubble ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        background: bg,
        color: '#121826',
        border: '2.5px solid #121826',
        borderRadius: '12px',
        padding: padSizes[size] || padSizes.md,
        boxShadow: '3px 3px 0px #121826',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: fontSizes[size] || fontSizes.md,
        fontWeight: 700,
        lineHeight: 1.35,
        userSelect: 'none',
        pointerEvents: 'none',
        zIndex: 10,
        ...style,
      }}
    >
      {children}
      {renderTail()}
    </div>
  );

  if (!animated) return bubbleContent;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{ display: 'inline-block', pointerEvents: 'none' }}
    >
      {bubbleContent}
    </motion.div>
  );
}
