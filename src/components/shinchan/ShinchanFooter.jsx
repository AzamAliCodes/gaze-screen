import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShinchanLogo,
  DrivingPixelCar,
} from './ShinchanMascots';
import SpeechBubble from './SpeechBubble';
import { useTheme } from '../../context/ThemeContext';

const QUOTES = [
  'Did you know? Even Action Kamen takes regular 20-20-20 eye breaks!',
  'Waku-waku! Buriburizaemon says: Focus now, rescue later!',
  'Concentration level: Surpasses Action Kamen Beam!',
  'Zero data sent to Principal Ench-man! Pure on-device privacy!',
  'Chocobi snack time after a great screening session!',
];

export default function ShinchanFooter({ className = '', style = {} }) {
  const { isShinchanTheme } = useTheme();
  const [quoteIdx, setQuoteIdx] = useState(0);

  const cycleQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % QUOTES.length);
  };

  if (!isShinchanTheme) {
    return null;
  }

  return (
    <footer
      className={`shinchan-footer ${className}`}
      style={{
        borderTop: '2.5px solid var(--ink)',
        background: isShinchanTheme ? '#FFFEEF' : '#ffffff',
        padding: '2rem 1.5rem 1.75rem',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 5,
        ...style,
      }}
    >
      <div
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          position: 'relative',
          zIndex: 5,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Centered: Authentic Interactive Mascot Pair & Random Shinchan Quote Generator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            position: 'relative',
            background: '#ffffff',
            border: '2px solid var(--ink)',
            boxShadow: '3px 3px 0px var(--ink)',
            borderRadius: '4px',
            padding: '12px 18px',
            overflow: 'visible',
            maxWidth: 520,
          }}
        >
          {/* Driving Pixel Car circling this interactive tips box */}
          <div className="shinchan-hide-mobile">
            <DrivingPixelCar size={38} duration={14} />
          </div>

          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            onClick={cycleQuote}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
            title="Click Shinchan for comic wisdom!"
          >
            <ShinchanLogo size={52} />
          </motion.div>

          <div style={{ maxWidth: 360 }}>
            <SpeechBubble tail="left" variant="yellow" size="sm" animated={false}>
              <span style={{ cursor: 'pointer' }} onClick={cycleQuote}>
                {QUOTES[quoteIdx]}
              </span>
            </SpeechBubble>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.66rem',
                color: 'var(--ink-muted)',
                marginTop: 6,
                fontWeight: 600,
                textAlign: 'left',
              }}
            >
              (Tap Shinchan to shuffle tips!)
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
