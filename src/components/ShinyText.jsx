import { motion } from 'framer-motion';

/**
 * ShinyText — React Bits component pattern
 * Renders an elegant animated metallic/color shine sweep across typography.
 */
export default function ShinyText({
  children,
  className = '',
  color = '#0f172a',
  shineColor = '#22c55e',
  speed = 3,
  style = {},
}) {
  return (
    <span
      className={`shiny-text-wrapper ${className}`}
      style={{
        display: 'inline-block',
        position: 'relative',
        background: `linear-gradient(120deg, ${color} 0%, ${color} 38%, ${shineColor} 50%, ${color} 62%, ${color} 100%)`,
        backgroundSize: '220% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: `shiny-sweep ${speed}s ease-in-out infinite`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
