/**
 * Stimulus sequence definition for the 60-second attention test.
 * Alternates Social ↔ Geometric phases based on research protocols.
 */

export const STIMULUS_PHASES = [
  {
    id: 'intro',
    type: 'instruction',
    duration: 4000,
    label: 'Starting…',
    description: 'Calibrating gaze tracking',
  },
  {
    id: 'social_1',
    type: 'social',
    phase: 'social',
    duration: 12000,
    label: 'Social Scene',
    description: 'Faces & human interaction',
    bgColor: '#0f172a',
    accentColor: '#3b82f6',
  },
  {
    id: 'geometric_1',
    type: 'geometric',
    phase: 'geometric',
    duration: 10000,
    label: 'Visual Pattern',
    description: 'Abstract geometric shapes',
    bgColor: '#17102e',
    accentColor: '#facc15',
  },
  {
    id: 'social_2',
    type: 'social',
    phase: 'social',
    duration: 12000,
    label: 'Social Scene',
    description: 'Emotion & expression',
    bgColor: '#0c1a2e',
    accentColor: '#60a5fa',
  },
  {
    id: 'geometric_2',
    type: 'geometric',
    phase: 'geometric',
    duration: 10000,
    label: 'Visual Pattern',
    description: 'Dynamic fractal patterns',
    bgColor: '#1e112a',
    accentColor: '#a855f7',
  },
  {
    id: 'social_3',
    type: 'social',
    phase: 'social',
    duration: 8000,
    label: 'Social Scene',
    description: 'Playful interaction',
    bgColor: '#0f172a',
    accentColor: '#38bdf8',
  },
  {
    id: 'end',
    type: 'complete',
    duration: 4000,
    label: 'Complete',
    description: 'Processing your results…',
  },
];

export const TOTAL_STIMULUS_DURATION = STIMULUS_PHASES.reduce((s, p) => s + p.duration, 0);
