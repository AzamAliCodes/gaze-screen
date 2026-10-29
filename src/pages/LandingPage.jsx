import { useTheme } from '../context/ThemeContext';
import { useSession } from '../context/SessionContext';
import ThemeToggle from '../components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import MotionButton from '../components/MotionButton';
import ShinyText from '../components/ShinyText';
import SpotlightCard from '../components/SpotlightCard';
import {
  ShinchanLogo,
  FlyingMascot,
  RolePigMascot,
  MisaeMotherMascot,
  KantamRoboMascot,
  ActionKamenMascot,
  ActionPunchMascot,
  BumblebeeMascot,
  PartyShinchanMascot,
  LaptopCoderMascot,
  ShiroShinchanMascot,
  ShinchanLetterMascot,
  ShinchanHeadBalanceMascot,
  ShinchanBackpackMascot,
  DrivingPixelCar,
  ComicBgPattern,
} from '../components/shinchan/ShinchanMascots';
import ShinchanSticker from '../components/shinchan/ShinchanSticker';
import {
  HandDrawnArrow,
  SketchUnderline,
} from '../components/shinchan/DoodleDecorations';
import ShinchanFooter from '../components/shinchan/ShinchanFooter';

import {
  HeroStuartMascot,
  FlyingSuperMinion,
  CornerPeekingMinion,
  ScientistMinion,
  CelebratingBob,
  GuitarStuart,
  WavingStuart,
  RunningTourist,
  AdoringBob,
  BananaEvilDuo,
  GazeShiftMinion,
  ActionClawsMinion,
  CaptainMinion,
  DrivingMinionScooter,
  MinionGoggleEye,
  MinionLogo,
  MinionBgPattern,
} from '../components/minion/MinionMascots';
import MinionSticker from '../components/minion/MinionSticker';
import MinionSpeechBubble from '../components/minion/MinionSpeechBubble';
import MinionFooter from '../components/minion/MinionFooter';

/* ── Interactive Clinical Eye Icon with Synchronized Shiny Flare & Floating Motion ── */
function EyeLogo({ isMinionTheme }) {
  return (
    <motion.div
      style={{ position: 'relative', width: 90, height: 90, margin: '0 auto' }}
      whileHover={{ scale: 1.08 }}
      animate={{ y: [-5, 5, -5] }}
      transition={{
        y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
        scale: { type: 'spring', stiffness: 350, damping: 20 },
      }}
    >
      {/* Outer Optical Radar Flare Aura */}
      <motion.div
        style={{
          position: 'absolute',
          inset: -7,
          borderRadius: '50%',
          border: isMinionTheme
            ? '2.5px dashed rgba(36, 91, 158, 0.65)'
            : '2px dashed rgba(37, 99, 235, 0.45)',
          pointerEvents: 'none',
        }}
        animate={{ rotate: 360, scale: [0.97, 1.05, 0.97] }}
        transition={{
          rotate: { duration: 16, repeat: Infinity, ease: 'linear' },
          scale: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* Main Eye Container */}
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: isMinionTheme ? '#FED41E' : '#ffffff',
          border: '3px solid var(--ink)',
          boxShadow: '4px 4px 0px var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {isMinionTheme ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MinionGoggleEye size={72} style={{ filter: 'none' }} />
          </div>
        ) : (
          <>
            {/* Synchronized Shiny Flare Beam */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: '-100%',
                  background:
                    'linear-gradient(120deg, transparent 38%, rgba(37, 99, 235, 0.28) 46%, rgba(96, 165, 250, 0.8) 50%, rgba(37, 99, 235, 0.28) 54%, transparent 62%)',
                  backgroundSize: '220% 100%',
                  animation: 'shiny-sweep 3.5s ease-in-out infinite',
                }}
              />
            </div>

            {/* Clinical Eye SVG */}
            <svg
              width="46"
              height="46"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.8"
              style={{ position: 'relative', zIndex: 2 }}
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3.6" stroke="var(--ink)" strokeWidth="2" fill="#f8fafc" />
              <motion.circle
                cx="12"
                cy="12"
                r="2.1"
                fill="var(--blue-600)"
                animate={{
                  scale: [1, 1.35, 1],
                  fill: ['var(--blue-600)', '#60a5fa', 'var(--blue-600)'],
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx="13.1"
                cy="10.9"
                r="0.8"
                fill="#ffffff"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, isMinionTheme, isShinchanTheme, isClinicalTheme } = useTheme();
  const { session, resetSession } = useSession();

  const handleStartScreening = () => {
    if (session?.completed) {
      resetSession();
    }
    navigate('/consent');
  };

  return (
    <PageTransition>
      <div
        style={{
          minHeight: '100vh',
          background: isMinionTheme
            ? '#FEFCE8'
            : isShinchanTheme
            ? '#FFFEEF'
            : '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Minimalist Top Nav */}
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
          {/* Logo brand badge in nav */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: 0,
            }}
            title="GazeScreen Home"
          >
            {isMinionTheme ? (
              <MinionLogo size={36} />
            ) : isShinchanTheme ? (
              <ShinchanLogo size={36} />
            ) : (
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: '2px solid var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--yellow-400)',
                  boxShadow: '2.5px 2.5px 0px var(--ink)',
                  borderRadius: '3px',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" fill="var(--ink)" />
                </svg>
              </div>
            )}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: 'var(--ink)',
                fontSize: '1.05rem',
                letterSpacing: '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              GAZE
              <span
                style={{
                  color: isMinionTheme
                    ? '#245B9E'
                    : 'var(--orange-500)',
                }}
              >
                SCREEN
              </span>
            </span>
          </button>

          {/* Theme Toggle Segmented Control */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeToggle />
          </div>
        </nav>

        {/* Hero Section with Authentic Theme Layer */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3.5rem 1.5rem 2.5rem',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 5,
            background: isMinionTheme
              ? '#FEFCE8'
              : isShinchanTheme
              ? '#FFFEEF'
              : '#ffffff',
          }}
        >
          {/* Section-specific doodle background patterns */}
          <ComicBgPattern variant="doodle" opacity={0.30} />
          <MinionBgPattern opacity={0.26} />

          {/* ── MINION HERO MASCOTS (Only rendered when Minion theme active) ── */}
          <div
            className="minion-hide-mobile"
            style={{
              position: 'absolute',
              right: 'clamp(35px, calc((100vw - 920px) / 2 - 70px), 170px)',
              bottom: 'clamp(95px, 14vh, 175px)',
              zIndex: 8,
              pointerEvents: 'none',
            }}
          >
            <MinionSticker delay={0.4} interactive={false}>
              <HeroStuartMascot
                size={235}
                style={{
                  width: 'clamp(165px, 16vw, 235px)',
                  filter: 'drop-shadow(5px 7px 0px rgba(18,24,38,0.32))',
                }}
              />
            </MinionSticker>
          </div>

          <div
            className="minion-hide-mobile"
            style={{
              position: 'absolute',
              left: 'clamp(25px, 4.5vw, 85px)',
              top: 'clamp(25px, 4.5vh, 80px)',
              zIndex: 8,
              pointerEvents: 'none',
            }}
          >
            <MinionSticker delay={0.3} interactive={false}>
              <FlyingSuperMinion
                size={175}
                style={{
                  width: 'clamp(120px, 13vw, 185px)',
                  filter: 'drop-shadow(4px 6px 0px rgba(18,24,38,0.28))',
                }}
              />
            </MinionSticker>
          </div>

          <div
            className="minion-hide-mobile"
            style={{
              position: 'absolute',
              left: 'clamp(30px, 5.5vw, 110px)',
              bottom: 'clamp(10px, 2vh, 30px)',
              zIndex: 8,
              pointerEvents: 'none',
            }}
          >
            <MinionSticker delay={0.6} interactive={false}>
              <CornerPeekingMinion
                size={260}
                style={{
                  width: 'clamp(180px, 18vw, 260px)',
                  filter: 'drop-shadow(4px 6px 0px rgba(18,24,38,0.28))',
                }}
              />
            </MinionSticker>
          </div>

          {/* ── SHINCHAN HERO MASCOTS (Only rendered when Shinchan theme active) ── */}
          <div
            className="shinchan-hide-mobile"
            style={{
              position: 'absolute',
              right: 'clamp(25px, calc((100vw - 920px) / 2 - 130px), 110px)',
              bottom: 'clamp(115px, 16vh, 195px)',
              zIndex: 8,
              pointerEvents: 'none',
            }}
          >
            <ShinchanSticker delay={0.4} interactive={false}>
              <FlyingMascot size={320} style={{ width: 'clamp(240px, 24vw, 350px)', filter: 'drop-shadow(5px 7px 0px rgba(18,24,38,0.28))' }} />
            </ShinchanSticker>
          </div>

          <div
            className="shinchan-hide-mobile"
            style={{
              position: 'absolute',
              left: 'clamp(25px, 4.5vw, 90px)',
              top: 'clamp(30px, 5vh, 85px)',
              zIndex: 8,
              pointerEvents: 'none',
            }}
          >
            <ShinchanSticker delay={0.3} interactive={false}>
              <BumblebeeMascot size={135} style={{ width: 'clamp(95px, 10vw, 145px)', filter: 'drop-shadow(4px 5px 0px rgba(18,24,38,0.26))' }} />
            </ShinchanSticker>
          </div>

          <div
            className="shinchan-hide-mobile"
            style={{
              position: 'absolute',
              left: 'clamp(35px, 6.5vw, 130px)',
              bottom: 'clamp(10px, 2.5vh, 35px)',
              zIndex: 8,
              pointerEvents: 'none',
            }}
          >
            <ShinchanSticker delay={0.6} interactive={false}>
              <PartyShinchanMascot size={230} style={{ width: 'clamp(165px, 17vw, 245px)', filter: 'drop-shadow(4px 6px 0px rgba(18,24,38,0.26))' }} />
            </ShinchanSticker>
          </div>

          <div style={{ maxWidth: 960, width: '100%', textAlign: 'center', position: 'relative', zIndex: 10 }}>
            <EyeLogo isMinionTheme={isMinionTheme} />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{ marginTop: '1.75rem' }}
            >

              <h1 className="text-display" style={{ marginBottom: 10 }}>
                <ShinyText color="var(--ink)" shineColor="var(--blue-600, #2563eb)" speed={3.5}>
                  GAZESCREEN
                </ShinyText>
              </h1>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: isMinionTheme ? '#1E40AF' : 'var(--orange-600)',
                  marginBottom: '1.25rem',
                  letterSpacing: '-0.01em',
                  display: 'inline-block',
                  background: isMinionTheme ? '#FEF08A' : isShinchanTheme ? '#FFF7ED' : 'var(--orange-50)',
                  padding: '4px 14px',
                  border: (isMinionTheme || isShinchanTheme) ? '2px solid #111827' : '1.5px solid var(--orange-400)',
                  borderRadius: '4px',
                  boxShadow: (isMinionTheme || isShinchanTheme) ? '2px 2px 0px var(--ink)' : 'none',
                }}
              >
                Front-Camera Screening Aid for Pediatric ASD & ADHD
              </div>

              <p
                style={{
                  maxWidth: 640,
                  margin: '0 auto 2.25rem',
                  color: 'var(--ink-secondary)',
                  fontSize: '0.98rem',
                  lineHeight: 1.7,
                }}
              >
                A free, 60-second, privacy-first pediatric screening tool. Uses standard smartphone
                front cameras to measure involuntary gaze fixations and blink metrics — computed
                100% on-device. Zero video leaves the phone.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45 }}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                marginBottom: '3.5rem',
              }}
            >
              {/* Row 1: Primary Action & How It Works */}
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {/* Primary Action Button with Theme Prompts */}
                <div style={{ position: 'relative' }}>
                  {/* Shinchan Comic Arrow */}
                  {isShinchanTheme && (
                    <div
                      className="shinchan-hide-mobile"
                      style={{
                        position: 'absolute',
                        top: -34,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        zIndex: 2,
                      }}
                    >
                      <HandDrawnArrow direction="right-down" color="var(--orange-500)" width={32} height={22} />
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: 'var(--orange-600)',
                          background: '#FFF7ED',
                          padding: '2px 6px',
                          border: '1px solid var(--orange-300)',
                          borderRadius: '3px',
                          boxShadow: '1.5px 1.5px 0px var(--ink)',
                        }}
                      >
                        Boing! Tap here!
                      </span>
                    </div>
                  )}

                  {/* Minion Banana Arrow */}
                  {isMinionTheme && (
                    <div
                      className="minion-hide-mobile"
                      style={{
                        position: 'absolute',
                        top: -36,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        zIndex: 2,
                      }}
                    >
                      <HandDrawnArrow direction="right-down" color="#EAB308" width={34} height={24} />
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.74rem',
                          fontWeight: 900,
                          color: '#854D0E',
                          background: '#FEF9C3',
                          padding: '3px 10px',
                          border: '1.5px solid var(--ink)',
                          borderRadius: '4px',
                          boxShadow: '2px 2px 0px var(--ink)',
                        }}
                      >
                        Bello! Tap here!
                      </span>
                    </div>
                  )}

                  <MotionButton
                    variant="coral"
                    onClick={handleStartScreening}
                    style={{ fontSize: '0.95rem', padding: '14px 34px' }}
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    }
                  >
                    Start Screening Now
                  </MotionButton>
                </div>

                <MotionButton
                  variant="blue"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ fontSize: '0.95rem', padding: '14px 26px' }}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  }
                >
                  How It Works
                </MotionButton>
              </div>

              {/* Row 2: Explore Research Model */}
              <div>
                <MotionButton
                  variant="yellow"
                  onClick={() => navigate('/research')}
                  style={{ fontSize: '0.95rem', padding: '14px 28px' }}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 8 }}>
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  }
                >
                  Explore Research Model
                </MotionButton>
              </div>
            </motion.div>

          </div>
        </main>
        {/* Feature Cards Section */}
        <section
          style={{
            padding: '3.5rem 1.5rem',
            borderTop: '2.5px solid var(--ink)',
            background: (isShinchanTheme || isMinionTheme) ? '#FFFEEF' : '#fafaf9',
            position: 'relative',
            zIndex: 5,
          }}
        >
          {/* ── MINION THEME ARCHITECTURE FLANKS ── */}
          <div
            className="minion-hide-mobile"
            style={{
              position: 'absolute',
              left: 'clamp(0.5rem, 3vw, 3.5rem)',
              top: '8rem',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <ScientistMinion
              size={175}
              alt="Scientist Minion AI Edge Model"
              style={{
                width: 'clamp(120px, 13vw, 175px)',
                filter: 'drop-shadow(4px 5px 0px rgba(18,24,38,0.28))',
              }}
            />
          </div>

          <div
            className="minion-hide-mobile"
            style={{
              position: 'absolute',
              right: 'clamp(0.5rem, 3vw, 3.5rem)',
              top: '8rem',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <GuitarStuart
              size={170}
              alt="Stuart Minion Rocking Guitar"
              style={{
                width: 'clamp(120px, 13vw, 175px)',
                filter: 'drop-shadow(4px 5px 0px rgba(18,24,38,0.28))',
              }}
            />
          </div>

          {/* ── SHINCHAN THEME ARCHITECTURE FLANKS ── */}
          <div
            className="shinchan-hide-mobile"
            style={{
              position: 'absolute',
              left: 'clamp(0.5rem, 3vw, 3.5rem)',
              top: '8rem',
              pointerEvents: 'none',
              zIndex: 1,
              opacity: 0.9,
            }}
          >
            <ActionPunchMascot size={170} alt="Action Punch Shinchan" style={{ width: 'clamp(120px, 13vw, 180px)', filter: 'drop-shadow(4px 5px 0px rgba(18,24,38,0.22))' }} />
          </div>

          <div
            className="shinchan-hide-mobile"
            style={{
              position: 'absolute',
              right: 'clamp(0.5rem, 3vw, 3.5rem)',
              top: '8rem',
              pointerEvents: 'none',
              zIndex: 1,
              opacity: 0.9,
            }}
          >
            <LaptopCoderMascot size={160} alt="Shinchan Coding Laptop" style={{ width: 'clamp(120px, 13vw, 175px)', filter: 'drop-shadow(4px 5px 0px rgba(18,24,38,0.22))' }} />
          </div>

          <div style={{ maxWidth: 1040, margin: '0 auto', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span className="brutal-tag tag-dark">
                  Technical Architecture
                </span>
              </div>
              <h2 className="text-section" style={{ marginTop: 4, position: 'relative', display: 'inline-block' }}>
                Clinically Informed, Privacy-First
                <SketchUnderline color={isMinionTheme ? '#FED41E' : 'var(--yellow-400)'} height={8} style={{ marginTop: 6 }} />
              </h2>
            </div>

            {/* 4-Box Architecture Circuit Track with Driving Pixel Car circling the full perimeter */}
            <div
              style={{
                position: 'relative',
                overflow: 'visible',
                border: (isShinchanTheme || isMinionTheme) ? '2px dashed rgba(18, 24, 38, 0.28)' : 'none',
                borderRadius: '8px',
                padding: (isShinchanTheme || isMinionTheme) ? '14px' : '0',
                background: (isShinchanTheme || isMinionTheme) ? 'rgba(255, 255, 255, 0.75)' : 'transparent',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
                  gap: 20,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <SpotlightCard style={{ position: 'relative', padding: '1.6rem', background: '#ffffff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: '2px solid var(--ink)',
                    borderRadius: '3px',
                    background: 'var(--green-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    boxShadow: '3px 3px 0px var(--ink)',
                    color: 'var(--green-700)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3.5" />
                  </svg>
                </div>
                <div style={{ display: 'inline-block', marginBottom: 8 }}>
                  <span className="brutal-tag tag-green">Optical Engine</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink)', marginBottom: 6, fontSize: '0.98rem' }}>
                  Front-Camera Iris Tracking
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                  MediaPipe Face Mesh computes pupil positions, fixation durations, and saccades directly in the browser.
                </div>
              </SpotlightCard>

              <SpotlightCard style={{ position: 'relative', padding: '1.6rem', background: '#ffffff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: '2px solid var(--ink)',
                    borderRadius: '3px',
                    background: 'var(--purple-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    boxShadow: '3px 3px 0px var(--ink)',
                    color: 'var(--purple-700)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <rect x="9" y="9" width="6" height="6" />
                    <line x1="9" y1="1" x2="9" y2="4" />
                    <line x1="15" y1="1" x2="15" y2="4" />
                    <line x1="9" y1="20" x2="9" y2="23" />
                    <line x1="15" y1="20" x2="15" y2="23" />
                    <line x1="20" y1="9" x2="23" y2="9" />
                    <line x1="20" y1="14" x2="23" y2="14" />
                    <line x1="1" y1="9" x2="4" y2="9" />
                    <line x1="1" y1="14" x2="4" y2="14" />
                  </svg>
                </div>
                <div style={{ display: 'inline-block', marginBottom: 8 }}>
                  <span className="brutal-tag tag-purple">Edge Heuristics</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink)', marginBottom: 6, fontSize: '0.98rem' }}>
                  Local Neural Classifier
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                  Calculates composite Z-scores against published normative baselines without server dependencies.
                </div>
              </SpotlightCard>

              <SpotlightCard style={{ position: 'relative', padding: '1.6rem', background: '#ffffff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: '2px solid var(--ink)',
                    borderRadius: '3px',
                    background: 'var(--blue-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    boxShadow: '3px 3px 0px var(--ink)',
                    color: 'var(--blue-700)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div style={{ display: 'inline-block', marginBottom: 8 }}>
                  <span className="brutal-tag tag-blue">Zero Telemetry</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink)', marginBottom: 6, fontSize: '0.98rem' }}>
                  Complete Privacy Guard
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                  Zero frames recorded or transmitted off-device. Fully aligns with pediatric data protection guidelines.
                </div>
              </SpotlightCard>

              <SpotlightCard style={{ position: 'relative', padding: '1.6rem', background: '#ffffff', border: '2.5px solid var(--ink)', boxShadow: '5px 5px 0px var(--ink)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      border: '2px solid var(--ink)',
                      borderRadius: '3px',
                      background: 'var(--yellow-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '3px 3px 0px var(--ink)',
                      color: 'var(--amber-primary)',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                      <line x1="2" y1="20" x2="22" y2="20" />
                    </svg>
                  </div>
                </div>
                <div style={{ display: 'inline-block', marginBottom: 8 }}>
                  <span className="brutal-tag tag-yellow">Clinical Synthesis</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink)', marginBottom: 6, fontSize: '0.98rem' }}>
                  Plain-Language Report
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                  Categorizes directional risk (Low / Moderate / Elevated) with actionable guidance for pediatrician consultation.
                </div>
              </SpotlightCard>
              </div>

              {/* Driving Pixel Car on top for Shinchan Theme */}
              {isShinchanTheme && (
                <div
                  className="shinchan-hide-mobile"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 35,
                  }}
                >
                  <DrivingPixelCar size={46} duration={14} />
                </div>
              )}

              {/* Driving Minion Scooter on top for Minion Theme */}
              {isMinionTheme && (
                <div
                  className="minion-hide-mobile"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 35,
                  }}
                >
                  <DrivingMinionScooter size={46} duration={14} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          style={{
            padding: '3.5rem 1.5rem',
            borderTop: '2.5px solid var(--ink)',
            background: isMinionTheme ? '#FEFCE8' : isShinchanTheme ? 'transparent' : '#ffffff',
            position: 'relative',
            zIndex: 5,
            overflow: 'hidden',
          }}
        >
          {/* Background patterns */}
          <ComicBgPattern variant="doodle" opacity={0.25} />
          <MinionBgPattern opacity={0.24} />

          {/* ── MINION HOW IT WORKS FLANKS ── */}
          <div
            className="minion-hide-mobile"
            style={{
              position: 'absolute',
              left: 'clamp(0.5rem, 3vw, 3.5rem)',
              top: '4rem',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <CaptainMinion
              size={210}
              alt="Captain Minion Shield Protocol"
              style={{
                width: 'clamp(145px, 16vw, 215px)',
                filter: 'drop-shadow(5px 6px 0px rgba(18,24,38,0.3))',
              }}
            />
          </div>

          <div
            className="minion-hide-mobile"
            style={{
              position: 'absolute',
              right: 'clamp(0.5rem, 3vw, 3.5rem)',
              bottom: '4rem',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <BananaEvilDuo
              size={270}
              alt="Minion Offering Banana"
              style={{
                width: 'clamp(180px, 20vw, 280px)',
                filter: 'drop-shadow(4px 6px 0px rgba(18,24,38,0.3))',
              }}
            />
          </div>

          {/* ── SHINCHAN HOW IT WORKS FLANKS ── */}
          <div
            className="shinchan-hide-mobile"
            style={{
              position: 'absolute',
              left: 'clamp(0.5rem, 3vw, 3.5rem)',
              top: '4rem',
              pointerEvents: 'none',
              zIndex: 1,
              opacity: 0.92,
            }}
          >
            <KantamRoboMascot size={240} alt="Kantam Robo Mascot" style={{ width: 'clamp(160px, 18vw, 240px)', filter: 'drop-shadow(5px 7px 0px rgba(18,24,38,0.28))' }} />
          </div>

          <div
            className="shinchan-hide-mobile"
            style={{
              position: 'absolute',
              right: 'clamp(0.5rem, 3vw, 3.5rem)',
              bottom: '4rem',
              pointerEvents: 'none',
              zIndex: 1,
              opacity: 0.92,
            }}
          >
            <ActionKamenMascot size={180} alt="Action Kamen Superhero" style={{ width: 'clamp(130px, 14vw, 195px)', filter: 'drop-shadow(4px 6px 0px rgba(18,24,38,0.25))' }} />
          </div>

          <div style={{ maxWidth: (isShinchanTheme || isMinionTheme) ? 840 : 740, margin: '0 auto', position: 'relative', zIndex: 10 }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="brutal-tag tag-orange">
                  Workflow Pipeline
                </span>
              </div>
              <h2 className="text-section" style={{ marginTop: 6 }}>
                4 Simple Steps.
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { num: '01', title: 'Parental Consent & Age Selection', desc: 'Confirm parental authorization, participant age, and clinical privacy consent.', color: isMinionTheme ? '#245B9E' : 'var(--orange-500)', bg: '#fff7ed' },
                { num: '02', title: 'Optical & Reticle Calibration', desc: 'Verify ambient lighting, face framing, and real-time iris contrast centering.', color: isMinionTheme ? '#2563EB' : 'var(--blue-600)', bg: '#eff6ff' },
                { num: '03', title: '60s Dual-Stimulus Protocol', desc: 'Child watches alternating social scenes and geometric fractal patterns to capture reflexive gaze preference.', color: 'var(--purple-600)', bg: '#faf5ff' },
                { num: '04', title: 'Instant Comprehensive Report', desc: 'Instant on-device risk assessment, behavioral radar profile, and printable clinician summary.', color: isMinionTheme ? '#059669' : 'var(--green-600)', bg: '#f0fdf4' },
              ].map((step, idx) => (
                <SpotlightCard
                  key={idx}
                  style={{
                    padding: '1.15rem 1.5rem',
                    background: step.bg,
                    border: '2.5px solid var(--ink)',
                    boxShadow: '4px 4px 0px var(--ink)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        border: '2px solid var(--ink)',
                        borderRadius: '3px',
                        background: step.color,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        fontSize: '1rem',
                        flexShrink: 0,
                        boxShadow: '2px 2px 0px var(--ink)',
                      }}
                    >
                      {step.num}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '0.98rem' }}>
                          {step.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', lineHeight: 1.45 }}>
                        {step.desc}
                      </div>
                    </div>

                    {/* Shinchan theme step mascots */}
                    {isShinchanTheme && idx === 0 && (
                      <div style={{ marginLeft: 12, flexShrink: 0 }}>
                        <MisaeMotherMascot size={66} alt="Misae Nohara (Shinchan's Mother)" style={{ transform: 'scaleX(-1)', filter: 'drop-shadow(-2px 3px 0px rgba(18,24,38,0.2))' }} />
                      </div>
                    )}
                    {isShinchanTheme && idx === 1 && (
                      <div style={{ marginLeft: 12, flexShrink: 0 }}>
                        <ShinchanHeadBalanceMascot size={68} alt="Shinchan balancing Shiro for head alignment" style={{ filter: 'drop-shadow(2px 3px 0px rgba(18,24,38,0.18))' }} />
                      </div>
                    )}
                    {isShinchanTheme && idx === 2 && (
                      <div style={{ marginLeft: 12, flexShrink: 0 }}>
                        <ActionPunchMascot size={62} alt="Action Kamen Focus" style={{ transform: 'scaleX(-1)', filter: 'drop-shadow(-2px 3px 0px rgba(18,24,38,0.2))' }} />
                      </div>
                    )}
                    {isShinchanTheme && idx === 3 && (
                      <div style={{ marginLeft: 12, flexShrink: 0 }}>
                        <ShinchanLetterMascot size={74} alt="Shinchan running with report letter and Shiro" style={{ filter: 'drop-shadow(2px 3px 0px rgba(18,24,38,0.2))' }} />
                      </div>
                    )}

                    {/* Minion theme step mascots */}
                    {isMinionTheme && idx === 0 && (
                      <div style={{ marginLeft: 12, flexShrink: 0 }}>
                        <RunningTourist size={62} alt="Tourist Minion Parental Authorization" style={{ filter: 'drop-shadow(2px 3px 0px rgba(18,24,38,0.2))' }} />
                      </div>
                    )}
                    {isMinionTheme && idx === 1 && (
                      <div style={{ marginLeft: 12, flexShrink: 0 }}>
                        <GazeShiftMinion size={68} alt="Minion Gaze Tracking Calibration" style={{ filter: 'drop-shadow(2px 3px 0px rgba(18,24,38,0.2))' }} />
                      </div>
                    )}
                    {isMinionTheme && idx === 2 && (
                      <div style={{ marginLeft: 12, flexShrink: 0 }}>
                        <ActionClawsMinion size={62} alt="Minion Stimulus Protocol" style={{ filter: 'drop-shadow(2px 3px 0px rgba(18,24,38,0.2))' }} />
                      </div>
                    )}
                    {isMinionTheme && idx === 3 && (
                      <div style={{ marginLeft: 12, flexShrink: 0 }}>
                        <CelebratingBob size={66} alt="Celebrating Bob Screening Success" style={{ filter: 'drop-shadow(2px 3px 0px rgba(18,24,38,0.2))' }} />
                      </div>
                    )}
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── MINION BANANA YELLOW CTA BANNER ── */}
        {isMinionTheme && (
        <section
          style={{
            background: '#FED41E',
            borderTop: '3px solid var(--ink)',
            borderBottom: '3px solid var(--ink)',
            padding: '4rem 1.5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 5,
          }}
        >
          {/* Flying Super Minion on left flank */}
          <div
            className="minion-hide-mobile"
            style={{
              position: 'absolute',
              left: 'clamp(1rem, 4vw, 5rem)',
              bottom: '1rem',
              pointerEvents: 'none',
              zIndex: 8,
            }}
          >
            <FlyingSuperMinion
              size={185}
              alt="Flying Superhero Minion"
              style={{
                width: 'clamp(130px, 14vw, 190px)',
                filter: 'drop-shadow(5px 6px 0px rgba(18,24,38,0.32))',
              }}
            />
          </div>

          {/* Celebrating Bob on right flank */}
          <div
            className="minion-hide-mobile"
            style={{
              position: 'absolute',
              right: 'clamp(1rem, 4vw, 5rem)',
              bottom: '1.2rem',
              pointerEvents: 'none',
              zIndex: 8,
            }}
          >
            <CelebratingBob
              size={140}
              alt="Bob celebrating screening readiness"
              style={{
                width: 'clamp(100px, 10vw, 140px)',
                filter: 'drop-shadow(4px 6px 0px rgba(18,24,38,0.3))',
              }}
            />
          </div>

          <div style={{ maxWidth: 740, margin: '0 auto', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div
                style={{
                  background: '#DBEAFE',
                  border: '2px solid var(--ink)',
                  boxShadow: '2.5px 2.5px 0px var(--ink)',
                  borderRadius: '9999px',
                  padding: '5px 16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  fontWeight: 900,
                  color: '#1E40AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                READY TO BEGIN
              </div>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(1.85rem, 4.5vw, 2.85rem)',
                fontWeight: 900,
                color: '#111827',
                letterSpacing: '-0.02em',
                marginBottom: 12,
                lineHeight: 1.15,
              }}
            >
              Start the 60-Second Eye Screening
            </h2>
            <p
              style={{
                color: '#1F2937',
                fontSize: '1rem',
                lineHeight: 1.65,
                maxWidth: 580,
                margin: '0 auto 2.25rem',
                fontWeight: 600,
              }}
            >
              100% on-device iris telemetry, zero frames recorded, and immediate baseline report for pediatrician consultation.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <MotionButton
                variant="blue"
                onClick={handleStartScreening}
                style={{ fontSize: '1.05rem', padding: '16px 36px', background: '#245B9E', color: '#ffffff' }}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 8 }}>
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                }
              >
                Start Free Screening Now →
              </MotionButton>
            </div>
          </div>
        </section>
        )}

        {/* ── SHINCHAN COMIC RED CTA BANNER ── */}
        {isShinchanTheme && (
        <section
          style={{
            background: '#FF4B4B',
            borderTop: '3px solid var(--ink)',
            borderBottom: '3px solid var(--ink)',
            padding: '4rem 1.5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 5,
          }}
        >
          {/* Action Punch Shinchan Mascot on left flank of CTA banner */}
          <div
            className="shinchan-hide-mobile"
            style={{
              position: 'absolute',
              left: 'clamp(1rem, 4vw, 5rem)',
              bottom: '1rem',
              pointerEvents: 'none',
              zIndex: 8,
              opacity: 0.96,
            }}
          >
            <ActionPunchMascot
              size={185}
              alt="Action Punch Shinchan"
              style={{
                width: 'clamp(130px, 14vw, 190px)',
                filter: 'drop-shadow(5px 6px 0px rgba(18,24,38,0.32))',
              }}
            />
          </div>

          {/* Shinchan & Shiro running with letter on right flank */}
          <div
            className="shinchan-hide-mobile"
            style={{
              position: 'absolute',
              right: 'clamp(1rem, 4vw, 5rem)',
              bottom: '1.5rem',
              pointerEvents: 'none',
              zIndex: 8,
              opacity: 0.95,
            }}
          >
            <ShinchanLetterMascot
              size={150}
              alt="Shinchan & Shiro running with invitation letter"
              style={{
                width: 'clamp(115px, 13vw, 165px)',
                filter: 'drop-shadow(4px 6px 0px rgba(18,24,38,0.3))',
              }}
            />
          </div>

          <div style={{ maxWidth: 740, margin: '0 auto', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div
                style={{
                  background: '#FEE883',
                  border: '2.5px solid var(--ink)',
                  boxShadow: '2.5px 2.5px 0px var(--ink)',
                  borderRadius: '9999px',
                  padding: '5px 16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  fontWeight: 900,
                  color: '#1E1B24',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                READY TO BEGIN?
              </div>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(1.85rem, 4.5vw, 2.85rem)',
                fontWeight: 900,
                color: '#ffffff',
                textShadow: '3.5px 3.5px 0px var(--ink)',
                letterSpacing: '-0.02em',
                marginBottom: 12,
                lineHeight: 1.15,
              }}
            >
              Start the 60-Second Eye Screening
            </h2>
            <p
              style={{
                color: '#ffffff',
                fontSize: '1rem',
                lineHeight: 1.65,
                maxWidth: 580,
                margin: '0 auto 2.25rem',
                fontWeight: 600,
                opacity: 0.96,
              }}
            >
              100% on-device iris telemetry, zero frames recorded, and immediate baseline report for pediatrician consultation.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <MotionButton
                variant="yellow"
                onClick={handleStartScreening}
                style={{ fontSize: '1.05rem', padding: '16px 36px' }}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 8 }}>
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                }
              >
                Start Free Screening Now →
              </MotionButton>
            </div>
          </div>
        </section>
        )}

        {/* ── FOOTERS (Conditional per Theme) ── */}
        <MinionFooter />
        <ShinchanFooter />

        {/* Clinical Disclaimer Footer */}
        <footer
          style={{
            padding: '2.5rem 1.5rem',
            borderTop: '2.5px solid var(--ink)',
            background: isMinionTheme ? '#FEFCE8' : isShinchanTheme ? '#FFFEEF' : 'var(--yellow-50)',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <div style={{ maxWidth: 940, margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <span className="brutal-tag tag-yellow" style={{ flexShrink: 0, marginTop: 2, padding: '5px 10px', fontSize: '0.74rem' }}>
              ⚠ MANDATORY MEDICAL DISCLAIMER
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink)', lineHeight: 1.7, margin: 0, flex: 1 }}>
              GazeScreen is an <strong style={{ color: 'var(--ink)' }}>early screening aid, not a formal diagnostic tool</strong>.
              Results are generated via experimental digital biomarker patterns and do not substitute for comprehensive neurodevelopmental
              assessment by a licensed developmental pediatrician or child psychologist.
            </p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
