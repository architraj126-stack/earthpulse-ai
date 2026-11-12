import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SkeletonLoader from './components/SkeletonLoader';

// Lazy-loaded routes for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AtlasPage = lazy(() => import('./pages/AtlasPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const KnowledgeBasePage = lazy(() => import('./pages/KnowledgeBasePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const DetectiveCasesPage = lazy(() => import('./pages/DetectiveCasesPage'));

function AppShell() {
  const location = useLocation();
  // Full-bleed workspaces (/investigate, /atlas) manage viewport cleanly without trailing footer noise on desktop
  const hideFooter =
    location.pathname === '/investigate' ||
    location.pathname === '/dashboard' ||
    location.pathname === '/atlas';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar />
      <main className="flex-1 flex flex-col min-h-0">
        <Suspense fallback={<SkeletonLoader text="Loading EarthPulse Observatory..." />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/investigate" element={<DashboardPage />} />
            <Route path="/dashboard" element={<Navigate to="/investigate" replace />} />
            <Route path="/cases" element={<DetectiveCasesPage />} />
            <Route path="/detective" element={<Navigate to="/cases" replace />} />
            <Route path="/atlas" element={<AtlasPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/learn" element={<KnowledgeBasePage />} />
            <Route path="/knowledge" element={<Navigate to="/learn" replace />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppShell />
      </Router>
    </ThemeProvider>
  );
}
