import { useState, useEffect, useRef } from 'react';

/**
 * DecryptedText — React Bits component pattern
 * Randomly cycles through glyphs before settling on the target text.
 */
const GLYPHS = '0123456789ABCDEF!@#$%&*<>[]{}';

export default function DecryptedText({
  text = '',
  speed = 40,
  maxIterations = 12,
  sequential = true,
  className = '',
  style = {},
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef(null);

  const triggerScramble = () => {
    let iteration = 0;
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(() => {
        return text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (sequential && index < iteration / 2) {
              return text[index];
            }
            if (!sequential && iteration > maxIterations) {
              return text[index];
            }
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join('');
      });

      iteration += 1;
      if (iteration > (sequential ? text.length * 2 : maxIterations)) {
        clearInterval(intervalRef.current);
        setDisplayText(text);
      }
    }, speed);
  };

  useEffect(() => {
    triggerScramble();
    return () => clearInterval(intervalRef.current);
  }, [text]);

  return (
    <span
      className={`decrypted-text ${className}`}
      style={{
        fontFamily: 'var(--font-mono)',
        cursor: 'default',
        userSelect: 'none',
        ...style,
      }}
      onMouseEnter={() => {
        setIsHovering(true);
        triggerScramble();
      }}
      onMouseLeave={() => setIsHovering(false)}
    >
      {displayText}
    </span>
  );
}
