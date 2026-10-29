import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Check } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import MotionButton from '../components/MotionButton';
import ShinyText from '../components/ShinyText';
import SpotlightCard from '../components/SpotlightCard';
import { useSession } from '../context/SessionContext';
import { getCohortInfo } from '../lib/classifier';
import {
  MisaeMotherMascot,
  ActionKamenMascot,
  ShinchanBackpackMascot,
  DrivingPixelCar,
  ComicBgPattern,
} from '../components/shinchan/ShinchanMascots';
import SpeechBubble from '../components/shinchan/SpeechBubble';
import { HandDrawnArrow } from '../components/shinchan/DoodleDecorations';
import {
  WavingStuart,
  RunningTourist,
  CelebratingBob,
  DrivingMinionScooter,
  MinionBgPattern,
} from '../components/minion/MinionMascots';
import MinionSpeechBubble from '../components/minion/MinionSpeechBubble';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

function NavBar() {
  const navigate = useNavigate();
  const { isMinionTheme } = useTheme();
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1.5rem',
        borderBottom: '2.5px solid var(--ink)',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <button
        onClick={() => navigate('/')}
        type="button"
        title="Navigate to Home"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          color: 'var(--ink)',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        GAZE<span style={{ color: isMinionTheme ? '#245B9E' : 'var(--orange-500)' }}>SCREEN</span>
      </button>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <ThemeToggle />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 24,
              height: 7,
              background: i === 1 ? 'var(--blue-600)' : '#e2e8f0',
              border: '1.5px solid var(--ink)',
              borderRadius: '2px',
              transition: 'background 0.2s',
            }}
          />
        ))}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--ink)',
            marginLeft: 6,
            background: '#f1f5f9',
            padding: '2px 6px',
            border: '1.5px solid var(--ink)',
            borderRadius: '3px',
          }}
        >
          STEP 1/4
        </span>
        </div>
      </div>
    </nav>
  );
}

function FormField({
  label,
  type = 'text',
  value,
  onChange,
  onKeyDown,
  onPaste,
  placeholder,
  required,
  min,
  max,
  inputMode,
  pattern,
  maxLength,
  title,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.74rem',
          fontWeight: 700,
          color: 'var(--ink)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {label} {required && <span style={{ color: 'var(--red-primary)' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder={placeholder}
        min={min}
        max={max}
        inputMode={inputMode}
        pattern={pattern}
        maxLength={maxLength}
        title={title}
        style={{
          background: '#ffffff',
          border: '2px solid var(--ink)',
          color: 'var(--ink)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.95rem',
          padding: '12px 14px',
          outline: 'none',
          borderRadius: '3px',
          boxShadow: '2.5px 2.5px 0px var(--ink)',
          transition: 'all 0.15s',
          width: '100%',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--ink)';
          e.target.style.boxShadow = '3.5px 3.5px 0px var(--ink)';
          e.target.style.background = '#f8fafc';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--ink)';
          e.target.style.boxShadow = '2.5px 2.5px 0px var(--ink)';
          e.target.style.background = '#ffffff';
        }}
      />
    </div>
  );
}

function ConsentClause({ svgIcon, tag, text, checked, onChange, checkedColor = 'var(--green-600)', checkedBg = '#f0fdf4' }) {
  return (
    <motion.label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        cursor: 'pointer',
        padding: '1.15rem 1.35rem',
        border: '2.5px solid var(--ink)',
        borderRadius: '4px',
        background: checked ? checkedBg : '#ffffff',
        boxShadow: checked ? `4px 4px 0px var(--ink)` : '3px 3px 0px var(--ink)',
        transition: 'all 0.15s ease',
      }}
      whileHover={{ x: 2, y: -1 }}
    >
      <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
        />
        <div
          style={{
            width: 24,
            height: 24,
            border: '2px solid var(--ink)',
            borderRadius: '3px',
            background: checked ? checkedColor : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '1.5px 1.5px 0px var(--ink)',
            transition: 'all 0.15s',
          }}
        >
          {checked && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          {svgIcon && (
            <span style={{ display: 'inline-flex', alignItems: 'center', color: checked ? checkedColor : 'var(--ink)' }}>
              {svgIcon}
            </span>
          )}
          {tag && <span className={`brutal-tag ${tag.className}`}>{tag.label}</span>}
        </div>
        <span style={{ fontSize: '0.88rem', color: 'var(--ink)', lineHeight: 1.6, fontWeight: 500 }}>
          {text}
        </span>
      </div>
    </motion.label>
  );
}

export default function ConsentPage() {
  const navigate = useNavigate();
  const { isMinionTheme, isShinchanTheme } = useTheme();
  const { session, updateSession, resetSession } = useSession();

  // If coming from a completed scan session, start completely fresh
  const isCompletedSession = Boolean(session?.completed);

  const [form, setForm] = useState({
    parentName: isCompletedSession ? '' : (session?.parentName || ''),
    childName: isCompletedSession ? '' : (session?.childName || ''),
    childAge: isCompletedSession ? '' : (session?.childAge || ''),
  });
  const [consents, setConsents] = useState({
    camera: isCompletedSession ? false : Boolean(session?.consentGiven),
    noVideo: isCompletedSession ? false : Boolean(session?.consentGiven),
    notDiagnosis: isCompletedSession ? false : Boolean(session?.consentGiven),
    age: isCompletedSession ? false : Boolean(session?.consentGiven),
  });

  // Purge any completed session cache from browser so new entry is clean
  useEffect(() => {
    if (isCompletedSession) {
      resetSession();
    }
  }, [isCompletedSession, resetSession]);

  const isAgeEntered = form.childAge.trim().length > 0;
  const numAge = parseInt(form.childAge, 10);
  const isValidAge = isAgeEntered && !isNaN(numAge) && numAge >= 1 && numAge <= 99;
  const cohort = getCohortInfo(isValidAge ? numAge : NaN);
  const allConsented = Object.values(consents).every(Boolean);
  const formFilled = form.parentName.trim() && form.childName.trim() && isValidAge;
  const canProceed = allConsented && formFilled;

  const handleAgeChange = (raw) => {
    // Strictly positive integers (1–99): strip non-digits and leading zeros
    const digitsOnly = String(raw).replace(/\D/g, '').replace(/^0+/, '');
    if (!digitsOnly) {
      setForm((p) => ({ ...p, childAge: '' }));
      return;
    }
    const val = parseInt(digitsOnly, 10);
    if (val > 99) {
      setForm((p) => ({ ...p, childAge: '99' }));
    } else {
      setForm((p) => ({ ...p, childAge: String(val) }));
    }
  };

  const handleAgeKeyDown = (e) => {
    // Allow keyboard navigation & shortcuts (Backspace, Delete, Tab, Arrow keys, Home, End, Enter, Ctrl/Cmd shortcuts)
    if (
      ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    // Block non-digits (minus sign, plus, decimal, exponential e, letters, symbols)
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    // Block '0' if the field is currently empty (enforcing positive numbers only)
    if (e.key === '0' && (!form.childAge || form.childAge.length === 0)) {
      e.preventDefault();
    }
  };

  const handleAgePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData ? e.clipboardData.getData('text') : '';
    handleAgeChange(pastedText);
  };

  const handleProceed = () => {
    updateSession({
      consentGiven: true,
      parentName: form.parentName,
      childName: form.childName,
      childAge: form.childAge,
    });
    navigate('/calibration');
  };

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: isMinionTheme ? '#FEFCE8' : isShinchanTheme ? '#FFFEEF' : '#ffffff', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <ComicBgPattern variant="doodle" opacity={0.28} />
        <MinionBgPattern opacity={0.26} />
        <NavBar />

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem', position: 'relative' }}>
          <div style={{ maxWidth: 780, width: '100%', position: 'relative', zIndex: 10 }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1rem', position: 'relative', zIndex: 10 }}>
              <h1 className="text-section" style={{ marginTop: 2, marginBottom: 2, fontSize: '1.65rem' }}>
                <ShinyText color="var(--ink)" shineColor={isMinionTheme ? '#245B9E' : 'var(--blue-600)'}>
                  Participant Details &amp; Consent
                </ShinyText>
              </h1>
              <p style={{ color: 'var(--ink-secondary)', fontSize: '0.84rem', lineHeight: 1.45, margin: 0 }}>
                Enter participant demographic details and confirm parental declarations to begin the 60-second natural viewing assessment.
              </p>
            </motion.div>

            {/* Demographic Profile Card — Flanked by Shinchan/Minion mascots */}
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              {isMinionTheme && (
                <>
                  <div
                    className="minion-hide-mobile"
                    style={{
                      position: 'absolute',
                      right: 'calc(100% + 22px)',
                      top: 8,
                      pointerEvents: 'none',
                      zIndex: 5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <MinionSpeechBubble text="Bello! 60s test!" direction="bottom-right" variant="yellow" size="sm" />
                    <RunningTourist size={165} alt="Tourist Minion ready for screening" style={{ filter: 'drop-shadow(4px 6px 0px rgba(18,24,38,0.26))' }} />
                  </div>

                  <div
                    className="minion-hide-mobile"
                    style={{
                      position: 'absolute',
                      left: 'calc(100% + 22px)',
                      top: 8,
                      pointerEvents: 'none',
                      zIndex: 5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <MinionSpeechBubble text="Fill the details here!" direction="bottom-left" variant="blue" size="sm" />
                    <WavingStuart size={150} alt="Waving Stuart Minion" style={{ filter: 'drop-shadow(4px 6px 0px rgba(18,24,38,0.26))' }} />
                  </div>
                </>
              )}

              {isShinchanTheme && (
                <>
                  {/* Shinchan with Backpack on Left Outer Flank — grounded with card base */}
                  <div
                    className="shinchan-hide-mobile"
                    style={{
                      position: 'absolute',
                      right: 'calc(100% + 20px)',
                      bottom: 4,
                      pointerEvents: 'none',
                      zIndex: 5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <SpeechBubble tail="bottom-right" variant="coral" size="sm">
                      <span>Ready for 60s test!</span>
                    </SpeechBubble>
                    <ShinchanBackpackMascot size={125} alt="Shinchan with school backpack" style={{ filter: 'drop-shadow(3px 5px 0px rgba(18,24,38,0.24))' }} />
                  </div>

                  {/* Misae (Mother) on Right Outer Flank — flipped so her gesturing hand points directly at the inputs! */}
                  <div
                    className="shinchan-hide-mobile"
                    style={{
                      position: 'absolute',
                      left: 'calc(100% + 20px)',
                      bottom: 4,
                      pointerEvents: 'none',
                      zIndex: 5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <SpeechBubble tail="bottom-right" variant="yellow" size="sm">
                      <span>Fill details here!</span>
                    </SpeechBubble>
                    <MisaeMotherMascot
                      size={135}
                      alt="Misae Nohara"
                      style={{
                        transform: 'scaleX(-1)',
                        filter: 'drop-shadow(-3px 5px 0px rgba(18,24,38,0.24))',
                      }}
                    />
                  </div>
                </>
              )}

              <SpotlightCard style={{ position: 'relative', padding: '1.35rem 1.5rem', background: '#eff6ff', border: '2.5px solid var(--ink)', boxShadow: '4px 4px 0px var(--ink)', overflow: 'visible' }}>
                {/* Driving Pixel Car running along card perimeter */}
                <div className="shinchan-hide-mobile">
                  <DrivingPixelCar size={38} duration={14} />
                </div>
                {/* Driving Minion Scooter running along card perimeter */}
                <div className="minion-hide-mobile">
                  <DrivingMinionScooter size={44} duration={14} />
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--ink)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ width: 10, height: 10, background: 'var(--blue-600)', display: 'inline-block' }} />
                  Demographic Profile
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: 14 }}>
                  <FormField
                    label="Parent / Observer Name"
                    value={form.parentName}
                    onChange={(v) => setForm((p) => ({ ...p, parentName: v }))}
                    placeholder="e.g. Alex Morgan"
                    required
                  />
                  <FormField
                    label="Subject's Name / ID"
                    value={form.childName}
                    onChange={(v) => setForm((p) => ({ ...p, childName: v }))}
                    placeholder="e.g. Leo M."
                    required
                  />
                  <FormField
                    label="Subject's Age"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    value={form.childAge}
                    onChange={handleAgeChange}
                    onKeyDown={handleAgeKeyDown}
                    onPaste={handleAgePaste}
                    placeholder="e.g. 6"
                    title="Enter positive age in years (1–99)"
                    required
                  />
                </div>

                {isValidAge ? (
                  <div
                    style={{
                      marginTop: 12,
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1.5px solid var(--ink)',
                      background: cohort.badgeBg,
                      boxShadow: '1.5px 1.5px 0px var(--ink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: cohort.badgeColor,
                          display: 'inline-block',
                        }}
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', color: 'var(--ink)' }}>
                        Cohort: {cohort.title}
                      </span>
                    </div>
                    <span className={`brutal-tag ${cohort.badgeClass}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                      ● AGE {numAge}
                    </span>
                  </div>
                ) : isAgeEntered ? (
                  <div
                    style={{
                      marginTop: 12,
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1.5px dashed var(--red-primary)',
                      background: '#fef2f2',
                      color: 'var(--red-primary)',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <AlertTriangle size={14} color="var(--red-primary)" strokeWidth={2.5} />
                    <span>Enter valid positive age (1–99 years).</span>
                  </div>
                ) : null}
              </SpotlightCard>
            </div>

            {/* Mandatory Declarations Card — Stacked below Demographic Card with original clinical text and symbols */}
            <SpotlightCard style={{ padding: '1.5rem 1.75rem', background: '#fafaf9', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)', marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.15rem',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--ink)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ width: 10, height: 10, background: 'var(--orange-500)', display: 'inline-block' }} />
                  <span>Mandatory Declarations</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !allConsented;
                    setConsents({ camera: nextVal, noVideo: nextVal, notDiagnosis: nextVal, age: nextVal });
                  }}
                  style={{
                    background: allConsented ? 'var(--green-100)' : '#ffffff',
                    border: '1.5px solid var(--ink)',
                    borderRadius: '3px',
                    padding: '4px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    boxShadow: '1.5px 1.5px 0px var(--ink)',
                  }}
                >
                  {allConsented ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Check size={13} strokeWidth={3} />
                      <span>All Accepted</span>
                    </span>
                  ) : (
                    'Accept All (4)'
                  )}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ConsentClause
                  svgIcon={
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  }
                  tag={{ label: 'Camera Stream', className: 'tag-blue' }}
                  text="I consent to the front camera tracking involuntary pupil gaze movements. No video frames or face images are stored or transmitted."
                  checked={consents.camera}
                  onChange={(v) => setConsents((p) => ({ ...p, camera: v }))}
                  checkedColor="var(--blue-600)"
                  checkedBg="#eff6ff"
                />
                <ConsentClause
                  svgIcon={
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  }
                  tag={{ label: '100% On-Device', className: 'tag-purple' }}
                  text="I acknowledge that all computer vision and risk heuristic calculations execute entirely on this local browser thread without cloud APIs."
                  checked={consents.noVideo}
                  onChange={(v) => setConsents((p) => ({ ...p, noVideo: v }))}
                  checkedColor="var(--purple-600)"
                  checkedBg="#faf5ff"
                />
                <ConsentClause
                  svgIcon={
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  }
                  tag={{ label: 'Non-Diagnostic', className: 'tag-yellow' }}
                  text="I understand GazeScreen is an early developmental screening aid and NOT a definitive clinical or medical diagnostic evaluation."
                  checked={consents.notDiagnosis}
                  onChange={(v) => setConsents((p) => ({ ...p, notDiagnosis: v }))}
                  checkedColor="var(--amber-primary)"
                  checkedBg="#fefce8"
                />
                <ConsentClause
                  svgIcon={
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v8" />
                      <path d="M8 12h8" />
                    </svg>
                  }
                  tag={{ label: 'Protocol Norms', className: 'tag-green' }}
                  text="I confirm the subject's age and understand that clinical reference norms are calibrated for developmental screening."
                  checked={consents.age}
                  onChange={(v) => setConsents((p) => ({ ...p, age: v }))}
                  checkedColor="var(--green-600)"
                  checkedBg="#f0fdf4"
                />
              </div>
            </SpotlightCard>

            {/* Bottom Actions Bar — Action Kamen beside the Begin Screening button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  background: '#FEE883',
                  border: '2px solid var(--ink)',
                  boxShadow: '2.5px 2.5px 0px var(--ink)',
                  borderRadius: '9999px',
                  padding: '9px 16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  color: '#1E1B24',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'transform 0.1s ease',
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(2px, 2px)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'none'; }}
              >
                ← BACK TO HOME
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                {/* Minion cheering beside Begin button */}
                {isMinionTheme && (
                  <div
                    className="minion-hide-mobile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <MinionSpeechBubble
                      text={canProceed ? 'Banana! All ready to screen!' : 'Fill details & accept all 4!'}
                      variant={canProceed ? 'yellow' : 'blue'}
                    />
                    <CelebratingBob size={145} alt="Celebrating Bob Minion" style={{ filter: 'drop-shadow(3px 5px 0px rgba(18,24,38,0.24))' }} />
                  </div>
                )}

                {/* Action Kamen cheering beside the Begin button */}
                {isShinchanTheme && (
                  <div
                    className="shinchan-hide-mobile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <SpeechBubble tail="right" variant={canProceed ? 'green' : 'yellow'} size="sm">
                      <span>{canProceed ? 'Action Kamen Approved! 60-Sec Screening Ready!' : 'Fill details & accept all 4 to begin!'}</span>
                    </SpeechBubble>
                    <ActionKamenMascot size={115} alt="Action Kamen Superhero" style={{ filter: 'drop-shadow(3px 5px 0px rgba(18,24,38,0.24))' }} />
                  </div>
                )}

                <MotionButton
                  variant="coral"
                  onClick={handleProceed}
                  disabled={!canProceed}
                  style={{
                    fontSize: '0.94rem',
                    padding: '12px 24px',
                    boxShadow: canProceed ? '3.5px 4.5px 0px var(--ink)' : 'none',
                  }}
                >
                  <span>Begin 60-Second Screening</span>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" style={{ marginLeft: 8 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </MotionButton>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
