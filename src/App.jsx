import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ConsentPage from './pages/ConsentPage';
import CalibrationPage from './pages/CalibrationPage';
import StimulusPage from './pages/StimulusPage';
import AnalysisPage from './pages/AnalysisPage';
import ReportPage from './pages/ReportPage';
import ResearchPage from './pages/ResearchPage';
import { SessionProvider } from './context/SessionContext';
import './App.css';

function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"            element={<LandingPage />} />
          <Route path="/consent"     element={<ConsentPage />} />
          <Route path="/calibration" element={<CalibrationPage />} />
          <Route path="/stimulus"    element={<StimulusPage />} />
          <Route path="/analysis"    element={<AnalysisPage />} />
          <Route path="/report"      element={<ReportPage />} />
          <Route path="/research"    element={<ResearchPage />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
