import { createContext, useContext, useState, useCallback } from 'react';

const SessionContext = createContext(null);

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
};

export function SessionProvider({ children }) {
  const [session, setSession] = useState({
    // Consent
    consentGiven: false,
    childAge: '4',
    childName: '',
    parentName: '',

    // Calibration
    calibrated: false,
    lightingOk: false,
    cameraReady: false,

    // Gaze tracking raw data
    gazePoints: [],          // [{x, y, timestamp, phase}]
    blinkEvents: [],         // [{timestamp, duration}]
    fixations: [],           // [{x, y, duration, phase}]
    saccades: [],            // [{from, to, speed}]

    // Session metadata
    sessionId: crypto.randomUUID(),
    startedAt: null,
    completedAt: null,
    totalDuration: 0,

    // Results
    riskLevel: null,         // 'low' | 'moderate' | 'elevated'
    riskScore: null,
    metrics: {
      socialAttentionRatio: null,
      avgFixationDuration: null,
      blinkRate: null,
      saccadeFrequency: null,
      gazeDivergence: null,
    },
    completed: false,
  });

  const updateSession = useCallback((patch) => {
    setSession(prev => ({ ...prev, ...patch }));
  }, []);

  const addGazePoint = useCallback((point) => {
    setSession(prev => ({
      ...prev,
      gazePoints: [...prev.gazePoints.slice(-2000), point], // keep last 2000
    }));
  }, []);

  const addBlinkEvent = useCallback((event) => {
    setSession(prev => ({
      ...prev,
      blinkEvents: [...prev.blinkEvents, event],
    }));
  }, []);

  const resetSession = useCallback(() => {
    setSession(prev => ({
      consentGiven: false,
      childAge: '',
      childName: '',
      parentName: '',
      calibrated: false,
      lightingOk: false,
      cameraReady: false,
      gazePoints: [],
      blinkEvents: [],
      fixations: [],
      saccades: [],
      sessionId: crypto.randomUUID(),
      startedAt: null,
      completedAt: null,
      totalDuration: 0,
      riskLevel: null,
      riskScore: null,
      metrics: {
        socialAttentionRatio: null,
        avgFixationDuration: null,
        blinkRate: null,
        saccadeFrequency: null,
        gazeDivergence: null,
      },
      completed: false,
    }));
  }, []);

  return (
    <SessionContext.Provider value={{ session, updateSession, addGazePoint, addBlinkEvent, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
}
