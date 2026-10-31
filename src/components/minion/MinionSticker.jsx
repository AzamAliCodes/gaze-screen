import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function MinionSticker({
  children,
  className = '',
  style = {},
  delay = 0,
  interactive = true,
  rotateHover = 5,
  scaleHover = 1.05,
}) {
  const { isMinionTheme } = useTheme();
  if (!isMinionTheme) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.45,
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      whileHover={
        interactive
          ? {
              scale: scaleHover,
              rotate: rotateHover,
              transition: { type: 'spring', stiffness: 350, damping: 15 },
            }
          : undefined
      }
      whileTap={interactive ? { scale: 0.95 } : undefined}
      className={`minion-sticker ${className}`}
      style={{
        display: 'inline-block',
        position: 'relative',
        cursor: interactive ? 'pointer' : 'default',
        transformOrigin: 'center center',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
