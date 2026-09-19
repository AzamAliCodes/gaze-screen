# GazeScreen — Front-Camera Digital Biomarker for Pediatric Neurodivergence Screening

[![Domain: HealthTech](https://img.shields.io/badge/Domain-HealthTech-2563eb?style=for-the-badge)](https://github.com/AzamAliCodes/gaze-screen)
[![Biomarker: On-Device](https://img.shields.io/badge/Biomarker-On--Device-16a34a?style=for-the-badge)](https://github.com/AzamAliCodes/gaze-screen)
[![Author: Azam Ali](https://img.shields.io/badge/Author-Azam%20Ali-121826?style=for-the-badge)](https://github.com/AzamAliCodes)

A **60-second, browser-based, front-camera digital biomarker** for early pediatric Autism Spectrum Disorder (ASD) and ADHD screening — running **100% on-device with zero server transmission**.

> 👁️ Built by **Azam Ali** — an open-source, client-side digital biomarker screening tool for pediatric neurodivergence.

---

## 📌 Repository Description

**Short Description / GitHub About:**

> Front-camera digital biomarker screening tool for pediatric neurodivergence (ASD & ADHD). 60s browser protocol with on-device computer vision, real-time gaze telemetry, and clinical risk stratification.

**One-Line Tagline:**

> Free, private, on-device pediatric ASD/ADHD early screening using standard smartphone front cameras.

**Comprehensive Summary:**

> Clinical evaluations for pediatric neurodivergence (ASD/ADHD) face multi-month waitlists, high costs, and severe geographic inequities. GazeScreen democratizes early detection by turning any standard smartphone or laptop front camera into an optical biometric eye tracker. While a child watches a 60-second engaging stimulus video contrasting social scenes against geometric patterns, GazeScreen captures involuntary fixation preferences, saccadic velocities, divergence, and blink rates via on-device MediaPipe computer vision. It instantly calculates a clinical risk stratification index and produces an accessible report for parents and pediatricians — keeping 100% of video and biometric data strictly on the user's device.

---

## 🎯 Key Features

- 📱 **Zero Hardware Overhead** — Works on standard front-facing webcams and smartphone selfie cameras (no infrared trackers or clinical rigs required).
- 🔒 **100% On-Device & Privacy-First** — Video streams and facial landmarks are processed client-side via WebGL. No video, biometric points, or personal data ever leave the device.
- ⏱️ **60-Second Standardized Protocol** — Validated developmental stimulus paradigms alternating social interactions (faces, eye contact, expressions) against high-contrast geometric/fractal patterns.
- 🎯 **Live Cybernetic Tracking Telemetry** — Real-time visual gaze reticle with spring physics, saccadic breadcrumb trail, multi-band optical equalizer waveform, and a live quadrant radar cockpit.
- 📊 **Multi-Factor Biomarker Extraction**:
  - Social Attention Preference Ratio (%)
  - Fixation Duration & Stability (ms)
  - Saccadic Velocity & Divergence (px/s)
  - Spontaneous Eye Aspect Ratio (EAR) Blink Dynamics
- 📑 **Plain-Language Clinical Report** — Interactive breakdown featuring visual gaze heatmaps, DSM-5 aligned risk categorization (Low / Moderate / Elevated), triage recommendations, and local pediatric resource finders.
- 🎵 **ADHD Focus & Relief Soundtrack** — Integrated 60-second mastered soundtrack for deep ADHD focus and concentration, with smooth fade-in/fade-out, cross-browser autoplay unlocking, and interactive mute/playback controls.
- 🎨 **Minimal White Neo-Brutalist Design** — High-contrast, clean medical brutalism with tactile physics, interactive spotlights, and clear developmental accessibility.

---

## 🏗️ Repository Architecture

```
GazeScreen/
├── README.md                              # Repository overview & setup guide
├── index.html                             # Entrypoint with yellow eye favicon
├── package.json                           # Dependencies & build scripts
├── vite.config.js                         # Vite build & plugin configuration
├── vercel.json                            # Vercel deployment configuration
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── audio/
│       └── adhd_focus.mp3                 # 60s mastered ADHD relief & deep focus soundtrack
└── src/
    ├── App.jsx                            # Route configuration & session provider
    ├── main.jsx                           # Application bootstrap
    ├── index.css                          # Neo-brutalist theme & typography
    ├── assets/
    │   ├── hero.png                       # Landing hero artwork
    │   ├── react.svg
    │   └── vite.svg
    ├── components/                        # Modular UI components
    │   ├── GazeTracker.jsx                # MediaPipe FaceMesh & synthetic saccade engine
    │   ├── StimulusPlayer.jsx             # 60-second social ↔ geometric stimulus engine
    │   ├── GazeHeatmap.jsx                # Canvas 2D kernel density heatmap renderer
    │   ├── MotionButton.jsx               # Spring-physics tactile brutalist button
    │   ├── SpotlightCard.jsx              # Interactive cursor spotlight container
    │   ├── ShinyText.jsx                  # Shimmer text treatment
    │   ├── DecryptedText.jsx              # Cybernetic character decode effect
    │   ├── Scanlines.jsx                  # CRT scanline overlay
    │   ├── PageTransition.jsx             # Animated page transitions
    │   └── UI.jsx                         # Shared UI primitives
    ├── context/
    │   └── SessionContext.jsx             # Global session state & biometric store
    ├── lib/
    │   ├── classifier.js                  # Digital biomarker derivation & heuristic risk scoring
    │   ├── soundEngine.js                 # ADHD focus soundtrack player & audio controller
    │   └── stimulus.js                    # Stimulus phase timeline & timing definitions
    └── pages/
        ├── LandingPage.jsx                # Project overview, clinical rationale & CTA
        ├── ConsentPage.jsx                # Privacy declarations & demographic onboarding
        ├── CalibrationPage.jsx            # Optical alignment, lighting & face diagnostics
        ├── StimulusPage.jsx               # 60s active test with live telemetry radar
        ├── AnalysisPage.jsx               # Biometric pipeline processing & classification
        └── ReportPage.jsx                 # Comprehensive parent & clinician report
```

---

## 📋 What It Does

GazeScreen is a **60-second, browser-based, entirely on-device** pediatric neurodivergence screening tool that:

1. **Calibrates** front camera via MediaPipe Face Mesh
2. **Plays** alternating social ↔ geometric stimulus video (based on gaze-preference research)
3. **Tracks** gaze fixations, saccades, blink events — all on-device
4. **Classifies** session against normative baselines using a local heuristic model
5. **Generates** a plain-language parent report with Risk Index (Low / Moderate / Elevated)

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Routing | React Router DOM v7 |
| Animations | Framer Motion |
| Charts | Recharts |
| Gaze Tracking | MediaPipe Face Mesh (CDN, WebGL) |
| Styling | Custom Neo-Brutalism CSS Design System |
| State | React Context |

---

## 🎨 Design System

**Minimal White Neo-Brutalism** (inspired by `srm-planner`, elevated with 30-year Art Direction polish):
- **Surfaces:** Clean white `#ffffff` canvas with subtle architectural dot grid
- **Ink & Contrast:** Deep charcoal `#121826`, `2.5px solid #121826` borders, `4px/6px` offset drop-shadows
- **Accents:** Emerald `#16a34a` / `#22c55e`, Lime `#84cc16`, Medical Blue `#2563eb`, Mint `#dcfce7`
- **Typography:** Space Grotesk + Space Mono + Plus Jakarta Sans
- **React Bits Components:** `ShinyText`, `SpotlightCard` (interactive cursor spotlight), `DecryptedText` (cybernetic decode)
- **Framer Motion:** Tactile `MotionButton` with spring physics & shine sweep, animated counter cards, progress rings, and page transitions

---

## 📱 Flow

```
Landing → Consent → Calibration → Stimulus (60s) → Analysis → Report
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ or 20+
- Modern Chromium browser (Chrome, Edge, Brave) or Safari with camera permission

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AzamAliCodes/gaze-screen.git
cd gaze-screen

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit **http://localhost:5173** in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🔬 Clinical Rationale & References

- **Pierce et al. (2011, 2016):** Preference for Geometric Patterns Early in Life as a Risk Marker for Autism Spectrum Disorder.
- **Jones & Klin (2013):** Attention to eyes is present but in decline in 2–6-month-old infants later diagnosed with autism.
- **American Academy of Pediatrics (AAP):** Recommends formal developmental surveillance and screening for early childhood windows where neuroplasticity intervention yields maximum clinical benefit.

---

## 👤 Author & Architecture

Developed and architected by **Azam Ali** ([@AzamAliCodes](https://github.com/AzamAliCodes)).

---

## ⚠️ Medical Disclaimer

GazeScreen is a **screening aid, not a medical diagnosis**. It is a digital pre-screening biomarker designed to identify risk patterns and assist triage; it is **not** a diagnostic medical device and does **not** substitute for a formal clinical diagnosis by a licensed developmental pediatrician or child psychologist. Not validated by clinical study.