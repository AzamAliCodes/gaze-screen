import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * SpotlightCard — React Bits pattern tailored for Neo-Brutalism
 * Adds an interactive subtle spotlight gradient following the mouse
 * while maintaining bold 3px black borders and 5px/7px drop shadows.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(100, 116, 139, 0.12)',
  borderColor = 'var(--ink)',
  style = {},
  onClick,
}) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <motion.div
      ref={cardRef}
      className={`brutal-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#ffffff',
        border: `3px solid ${borderColor}`,
        boxShadow: '5px 5px 0px var(--ink)',
        ...style,
      }}
      whileHover={{
        y: -4,
        x: -2,
        boxShadow: '7px 7px 0px var(--ink)',
        transition: { type: 'spring', stiffness: 450, damping: 25 },
      }}
      whileTap={{
        y: 2,
        x: 2,
        boxShadow: '2px 2px 0px var(--ink)',
        transition: { duration: 0.08 },
      }}
    >
      {/* React Bits spotlight overlay */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          opacity,
          transition: 'opacity 0.3s ease',
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </motion.div>
  );
}
