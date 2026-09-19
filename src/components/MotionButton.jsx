import { motion } from 'framer-motion';

/**
 * MotionButton — Neo-Brutalist Interactive Button
 * Implements tactile depth, spring physics, and React Bits style shine sweep
 * in a clean minimal white aesthetic.
 */
export default function MotionButton({
  children,
  className = '',
  onClick,
  disabled = false,
  variant = 'primary', // 'primary' | 'outline' | 'dark' | 'danger'
  style = {},
  icon,
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'coral':
        return {
          background: 'var(--orange-500)',
          color: '#ffffff',
          border: 'var(--border-brutal)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'yellow':
        return {
          background: 'var(--yellow-400)',
          color: 'var(--ink)',
          border: 'var(--border-brutal)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'blue':
        return {
          background: 'var(--blue-600)',
          color: '#ffffff',
          border: 'var(--border-brutal)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'purple':
        return {
          background: 'var(--purple-600)',
          color: '#ffffff',
          border: 'var(--border-brutal)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'outline':
        return {
          background: '#ffffff',
          color: 'var(--ink)',
          border: 'var(--border-brutal)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'dark':
        return {
          background: 'var(--ink)',
          color: '#ffffff',
          border: 'var(--border-brutal)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'danger':
        return {
          background: '#ef4444',
          color: '#ffffff',
          border: 'var(--border-brutal)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'primary':
      default:
        return {
          background: 'var(--green-500)',
          color: '#ffffff',
          border: 'var(--border-brutal)',
          boxShadow: 'var(--shadow-sm)',
        };
    }
  };

  const getHoverStyles = () => {
    switch (variant) {
      case 'coral':
        return {
          background: 'var(--orange-600)',
          boxShadow: 'var(--shadow-brutal)',
          x: -2,
          y: -2,
        };
      case 'yellow':
        return {
          background: 'var(--yellow-500)',
          boxShadow: 'var(--shadow-brutal)',
          x: -2,
          y: -2,
        };
      case 'blue':
        return {
          background: 'var(--blue-700)',
          boxShadow: 'var(--shadow-brutal)',
          x: -2,
          y: -2,
        };
      case 'purple':
        return {
          background: 'var(--purple-700)',
          boxShadow: 'var(--shadow-brutal)',
          x: -2,
          y: -2,
        };
      case 'outline':
        return {
          background: 'var(--bg-subtle)',
          boxShadow: 'var(--shadow-brutal)',
          x: -2,
          y: -2,
        };
      case 'dark':
        return {
          background: '#1e293b',
          boxShadow: 'var(--shadow-brutal)',
          x: -2,
          y: -2,
        };
      case 'danger':
        return {
          background: '#dc2626',
          boxShadow: 'var(--shadow-brutal)',
          x: -2,
          y: -2,
        };
      case 'primary':
      default:
        return {
          background: 'var(--green-600)',
          boxShadow: 'var(--shadow-brutal)',
          x: -2,
          y: -2,
        };
    }
  };

  return (
    <motion.button
      className={`brutal-btn ${className}`}
      style={{
        ...getVariantStyles(),
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      initial={false}
      whileHover={disabled ? {} : getHoverStyles()}
      whileTap={
        disabled
          ? {}
          : {
              x: 2,
              y: 2,
              boxShadow: '1px 1px 0px var(--ink)',
              transition: { duration: 0.08 },
            }
      }
      transition={{
        type: 'spring',
        stiffness: 450,
        damping: 25,
      }}
      onClick={disabled ? undefined : onClick}
    >
      {/* React Bits shine sweep effect */}
      {!disabled && (
        <motion.span
          style={{
            position: 'absolute',
            top: 0,
            left: '-120%',
            width: '60%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)',
            skewX: -20,
            pointerEvents: 'none',
          }}
          whileHover={{
            left: '180%',
            transition: { duration: 0.55, ease: 'easeInOut' },
          }}
        />
      )}
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>}
      {children}
    </motion.button>
  );
}
