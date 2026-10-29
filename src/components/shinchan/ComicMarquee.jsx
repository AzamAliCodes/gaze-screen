import React from 'react';

/**
 * Bold Comic Marquee ribbon inspired by https://recruitment.githubsrmist.in/
 */
export default function ComicMarquee({
  items = [
    '100% ON-DEVICE IRIS ENGINE',
    'ACTION KAMEN CERTIFIED',
    'ZERO CLOUD STORAGE',
    '60-SECOND CLINICAL AID',
    'PRIVATE & SECURE',
    'CHOCOBI NEURAL SPEED',
  ],
  bg = 'var(--yellow-300)',
  color = 'var(--ink)',
  borderColor = 'var(--ink)',
  speed = 22,
  reverse = false,
  className = '',
  style = {},
}) {
  const content = items.join('  ★  ') + '  ★  ';

  return (
    <div
      className={`comic-marquee-container ${className}`}
      style={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        background: bg,
        color,
        borderTop: `2.5px solid ${borderColor}`,
        borderBottom: `2.5px solid ${borderColor}`,
        padding: '8px 0',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        fontWeight: 900,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        position: 'relative',
        zIndex: 10,
        ...style,
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes comic-marquee-scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes comic-marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
      <div
        style={{
          display: 'inline-block',
          animation: `${reverse ? 'comic-marquee-reverse' : 'comic-marquee-scroll'} ${speed}s linear infinite`,
          willChange: 'transform',
        }}
      >
        <span>{content}</span>
        <span>{content}</span>
        <span>{content}</span>
        <span>{content}</span>
      </div>
    </div>
  );
}
