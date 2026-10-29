import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * Interactive sticker container for Shinchan artwork
 * Features subtle hover tilt, spring entrance, and accessibility safeguards.
 */
export default function ShinchanSticker({
  children,
  tilt = 3,
  delay = 0.2,
  interactive = false,
  hideOnMobile = false,
  className = '',
  style = {},
}) {
  const { isShinchanTheme } = useTheme();
  if (!isShinchanTheme) return null;

  return (
    <motion.div
      className={`shinchan-sticker ${hideOnMobile ? 'shinchan-hide-mobile' : ''} ${className}`}
      initial={{ opacity: 0, scale: 0.85, rotate: -tilt }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      whileHover={interactive ? { scale: 1.08, rotate: tilt } : undefined}
      transition={{
        opacity: { duration: 0.35, delay },
        scale: { type: 'spring', stiffness: 300, damping: 20, delay },
        rotate: { type: 'spring', stiffness: 200, damping: 15 },
      }}
      style={{
        display: 'inline-block',
        pointerEvents: interactive ? 'auto' : 'none',
        userSelect: 'none',
        zIndex: 10,
        ...style,
      }}
      aria-hidden="true"
    >
      {children}
    </motion.div>
  );
}
