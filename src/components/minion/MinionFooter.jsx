import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AdoringBob } from './MinionMascots';
import MinionSpeechBubble from './MinionSpeechBubble';
import { useTheme } from '../../context/ThemeContext';

const MINION_QUOTES = [
  'Bello! Did you know? Minions love 20-20-20 eye gaze rests!',
  'BANANA! 100% on-device private local telemetry!',
  'Tulaliloo ti amo! Optical gaze precision calibrated to perfection!',
  'Poopaye! Zero video ever leaves this phone. Fully secure and private!',
  'Bi-do bi-do! Eye tracking screening completed in under 60 seconds!',
  'Kampai! Stuart says: Look at the target, not the distractions!',
];

export default function MinionFooter({ className = '', style = {} }) {
  const { isMinionTheme } = useTheme();
  const [quoteIdx, setQuoteIdx] = useState(0);

  const cycleQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % MINION_QUOTES.length);
  };

  if (!isMinionTheme) {
    return null;
  }

  return (
    <footer
      className={`minion-footer ${className}`}
      style={{
        borderTop: '2.5px solid var(--ink)',
        background: '#FEFCE8',
        padding: '2.2rem 1.5rem 2rem',
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
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Interactive Quote Bubble with Adoring Bob */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={cycleQuote}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Click Bob to hear another Minion thought!"
          >
            <AdoringBob size={80} />
          </motion.div>

          <div onClick={cycleQuote} style={{ cursor: 'pointer' }}>
            <MinionSpeechBubble
              text={MINION_QUOTES[quoteIdx]}
              subtext="Tap for another Minion tip!"
              direction="bottom-left"
              variant="yellow"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
