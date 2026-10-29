import { createContext, useContext, useState, useCallback } from 'react';

const SessionContext = createContext(null);

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
};

const STORAGE_KEY = 'gazescreen_session_demographics';

function getInitialSessionData() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return {
            consentGiven: Boolean(parsed.consentGiven),
            childAge: parsed.childAge || '',
            childName: parsed.childName || '',
            parentName: parsed.parentName || '',
            gazePoints: Array.isArray(parsed.gazePoints) ? parsed.gazePoints : [],
            blinkEvents: Array.isArray(parsed.blinkEvents) ? parsed.blinkEvents : [],
            metrics: parsed.metrics || null,
            riskLevel: parsed.riskLevel || null,
            riskScore: parsed.riskScore ?? null,
            adhdScore: parsed.adhdScore ?? null,
            adhdLevel: parsed.adhdLevel || null,
            asdScore: parsed.asdScore ?? null,
            asdLevel: parsed.asdLevel || null,
            completed: Boolean(parsed.completed),
            sessionId: parsed.sessionId || crypto.randomUUID(),
          };
        }
      }
    }
  } catch (err) {
    console.warn('[SessionContext] Failed to load saved session from sessionStorage:', err);
  }
  return null;
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => {
    const saved = getInitialSessionData();
    return {
      // Consent & Demographics
      consentGiven: saved ? saved.consentGiven : false,
      childAge: saved ? saved.childAge : '',
      childName: saved ? saved.childName : '',
      parentName: saved ? saved.parentName : '',

      // Calibration
      calibrated: false,
      lightingOk: false,
      cameraReady: false,

      // Gaze tracking raw data
      gazePoints: saved?.gazePoints || [],          // [{x, y, timestamp, phase}]
      blinkEvents: saved?.blinkEvents || [],         // [{timestamp, duration}]
      fixations: [],           // [{x, y, duration, phase}]
      saccades: [],            // [{from, to, speed}]

      // Session metadata
      sessionId: saved?.sessionId || crypto.randomUUID(),
      startedAt: null,
      completedAt: null,
      totalDuration: 0,

      // Results
      riskLevel: saved?.riskLevel ?? null,         // 'low' | 'moderate' | 'elevated'
      riskScore: saved?.riskScore ?? null,
      adhdScore: saved?.adhdScore ?? null,
      adhdLevel: saved?.adhdLevel ?? null,
      asdScore: saved?.asdScore ?? null,
      asdLevel: saved?.asdLevel ?? null,
      metrics: saved?.metrics || {
        socialAttentionRatio: null,
        avgFixationDuration: null,
        blinkRate: null,
        saccadeFrequency: null,
        gazeDivergence: null,
      },
      completed: saved ? saved.completed : false,
    };
  });

  const updateSession = useCallback((patch) => {
    setSession(prev => {
      const next = { ...prev, ...patch };
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              consentGiven: next.consentGiven,
              childAge: next.childAge,
              childName: next.childName,
              parentName: next.parentName,
              gazePoints: next.gazePoints ? next.gazePoints.slice(-1000) : [],
              blinkEvents: next.blinkEvents || [],
              metrics: next.metrics,
              riskLevel: next.riskLevel,
              riskScore: next.riskScore,
              adhdScore: next.adhdScore,
              adhdLevel: next.adhdLevel,
              asdScore: next.asdScore,
              asdLevel: next.asdLevel,
              completed: next.completed,
              sessionId: next.sessionId,
            })
          );
        }
      } catch (err) {
        console.warn('[SessionContext] Failed to persist session to sessionStorage:', err);
      }
      return next;
    });
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
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.warn('[SessionContext] Failed to clear sessionStorage:', err);
    }
    setSession({
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
      adhdScore: null,
      adhdLevel: null,
      adhdProbability: null,
      asdScore: null,
      asdLevel: null,
      breakdown: null,
      cohort: null,
      cohortId: null,
      metrics: {
        socialAttentionRatio: null,
        avgFixationDuration: null,
        blinkRate: null,
        saccadeFrequency: null,
        gazeDivergence: null,
      },
      completed: false,
    });
  }, []);

  return (
    <SessionContext.Provider value={{ session, updateSession, addGazePoint, addBlinkEvent, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
}
