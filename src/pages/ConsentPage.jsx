import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Check } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import MotionButton from '../components/MotionButton';
import ShinyText from '../components/ShinyText';
import SpotlightCard from '../components/SpotlightCard';
import { useSession } from '../context/SessionContext';
import { getCohortInfo } from '../lib/classifier';

function NavBar() {
  const navigate = useNavigate();
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderBottom: '2.5px solid var(--ink)',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <button
        onClick={() => navigate('/')}
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
        GAZE<span style={{ color: 'var(--orange-500)' }}>SCREEN</span>
      </button>

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
    </nav>
  );
}

function FormField({ label, type = 'text', value, onChange, onKeyDown, placeholder, required, min, max }) {
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
        placeholder={placeholder}
        min={min}
        max={max}
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
  const { updateSession } = useSession();

  const [form, setForm] = useState({ parentName: '', childName: '', childAge: '' });
  const [consents, setConsents] = useState({ camera: false, noVideo: false, notDiagnosis: false, age: false });

  const isAgeEntered = form.childAge.trim().length > 0;
  const numAge = parseInt(form.childAge, 10);
  const isValidAge = isAgeEntered && !isNaN(numAge) && numAge >= 1 && numAge <= 99;
  const cohort = getCohortInfo(isValidAge ? numAge : NaN);
  const allConsented = Object.values(consents).every(Boolean);
  const formFilled = form.parentName.trim() && form.childName.trim() && isValidAge;
  const canProceed = allConsented && formFilled;

  const handleAgeChange = (raw) => {
    // Strictly positive integers: strip any non-digit character (blocking minus signs, commas, decimals, exponents)
    const digitsOnly = String(raw).replace(/\D/g, '');
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
    // Prevent negative signs, plus, exponents, and decimals on keyboard input
    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
      e.preventDefault();
    }
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
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <NavBar />

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ maxWidth: 740, width: '100%' }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <span className="brutal-tag tag-blue">Screening Intake</span>
                <span className="brutal-tag tag-yellow">All Ages Supported</span>
              </div>
              <h1 className="text-section" style={{ marginTop: 6, marginBottom: 8, fontSize: '2rem' }}>
                <ShinyText color="var(--ink)" shineColor="var(--blue-600)">
                  Participant Details & Protocol Consent
                </ShinyText>
              </h1>
              <p style={{ color: 'var(--ink-secondary)', fontSize: '0.94rem', lineHeight: 1.6 }}>
                Before beginning the 60-second digital screening, enter the participant details and
                review the clinical rationale and privacy safeguards below.
              </p>
            </motion.div>

            {/* Form Section */}
            <SpotlightCard style={{ padding: '2rem', marginBottom: '1.5rem', background: '#eff6ff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--ink)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ width: 10, height: 10, background: 'var(--blue-600)', display: 'inline-block' }} />
                Demographic Profile
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16 }}>
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
                    type="number"
                    min="1"
                    max="99"
                    value={form.childAge}
                    onChange={handleAgeChange}
                    onKeyDown={handleAgeKeyDown}
                    placeholder="e.g. 6"
                    required
                  />
                </div>

                {isValidAge ? (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '4px',
                      border: '2px solid var(--ink)',
                      background: cohort.badgeBg,
                      boxShadow: '2.5px 2.5px 0px var(--ink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: cohort.badgeColor,
                          display: 'inline-block',
                        }}
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.84rem', color: 'var(--ink)' }}>
                        Age Group: {cohort.title}
                      </span>
                    </div>
                    <span className={`brutal-tag ${cohort.badgeClass}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                      ● AGE {numAge}
                    </span>
                  </div>
                ) : isAgeEntered ? (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '4px',
                      border: '2px dashed var(--red-primary)',
                      background: '#fef2f2',
                      color: 'var(--red-primary)',
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={14} color="var(--red-primary)" strokeWidth={2.5} />
                      <span>Please enter a valid positive age between 1 and 99 years.</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </SpotlightCard>

            {/* Required Consents */}
            <SpotlightCard style={{ padding: '2rem', marginBottom: '2rem', background: '#fafaf9', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
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
                  Mandatory Declarations
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
                    padding: '3px 10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
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

            {/* Bottom Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
            >
              {!canProceed && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
                  {!formFilled ? 'Complete demographic details' : 'Accept all 4 declarations to proceed'}
                </span>
              )}
              <MotionButton variant="coral" onClick={handleProceed} disabled={!canProceed}>
                Continue to Camera Calibration
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 6 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </MotionButton>
            </motion.div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
