import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';

const THEME_OPTIONS = [
  {
    id: THEMES.MINION,
    label: 'MINION',
    btnBg: '#FEF08A',
    btnColor: '#1E3A8A',
    activeBg: '#FEF08A',
    textColor: '#1E3A8A',
  },
  {
    id: THEMES.SHINCHAN,
    label: 'SHINCHAN',
    btnBg: '#FFF7ED',
    btnColor: 'var(--orange-600, #ea580c)',
    activeBg: '#FFF7ED',
    textColor: 'var(--orange-600, #ea580c)',
  },
  {
    id: THEMES.CLINICAL,
    label: 'OFF',
    btnBg: '#F8FAFC',
    btnColor: '#475569',
    activeBg: '#F1F5F9',
    textColor: '#334155',
  },
];

export default function ThemeToggle({ className = '', style = {} }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const activeOption = THEME_OPTIONS.find((opt) => opt.id === theme) || THEME_OPTIONS[0];

  // Close on outside click or tap (handles both desktop mouse and mobile touch)
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (id) => {
    setTheme(id);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`theme-toggle-dropdown-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        zIndex: 50,
        ...style,
      }}
    >
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="CHANGE VISUAL THEME"
        style={{
          background: activeOption.btnBg,
          color: activeOption.btnColor,
        }}
      >
        <span className="theme-toggle-btn-text" style={{ textTransform: 'uppercase' }}>
          <span className="theme-toggle-prefix">THEME: </span>
          <span className="theme-toggle-name">{activeOption.label}</span>
        </span>
        <ChevronDown
          size={14}
          strokeWidth={3}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: activeOption.btnColor,
            flexShrink: 0,
          }}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="listbox"
            aria-label="SELECT THEME"
            className="theme-toggle-menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              minWidth: 165,
              maxWidth: 'calc(100vw - 24px)',
              background: '#FFFFFF',
              border: '2.5px solid var(--ink)',
              borderRadius: '8px',
              boxShadow: '4px 4px 0px var(--ink)',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              zIndex: 100,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                fontWeight: 900,
                color: 'var(--ink-secondary)',
                letterSpacing: '0.08em',
                padding: '4px 8px 3px',
                textTransform: 'uppercase',
                borderBottom: '1.5px solid #E2E8F0',
                marginBottom: 2,
              }}
            >
              SELECT THEME
            </div>

            {THEME_OPTIONS.map((opt) => {
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '8px 10px',
                    minHeight: '38px',
                    background: isSelected ? opt.activeBg : 'transparent',
                    border: isSelected ? '1.5px solid var(--ink)' : '1.5px solid transparent',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    fontWeight: isSelected ? 800 : 700,
                    color: isSelected ? opt.textColor : 'var(--ink)',
                    textAlign: 'left',
                    textTransform: 'uppercase',
                    transition: 'background 0.12s ease',
                    outline: 'none',
                    touchAction: 'manipulation',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ textTransform: 'uppercase' }}>{opt.label}</span>
                  </div>
                  {isSelected && <Check size={14} strokeWidth={3} style={{ color: opt.textColor }} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
