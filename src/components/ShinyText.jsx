/**
 * ShinyText — React Bits component pattern
 * Renders an elegant animated metallic/color shine sweep across typography.
 * Uses CSS background-clip: text with rock-solid flash protection during theme transitions.
 */
export default function ShinyText({
  children,
  className = '',
  color = 'var(--ink, #121826)',
  shineColor = 'var(--blue-600, #2563eb)',
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
