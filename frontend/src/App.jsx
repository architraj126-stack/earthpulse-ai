import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#071426] text-white">
        <Navbar />
        <div className="flex-1">
          <Suspense fallback={<SkeletonLoader text="Loading EarthPulse Scientific Workbench..." />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/investigate" element={<DashboardPage />} />
              <Route path="/dashboard" element={<Navigate to="/investigate" replace />} />
              <Route path="/atlas" element={<AtlasPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/learn" element={<KnowledgeBasePage />} />
              <Route path="/knowledge" element={<Navigate to="/learn" replace />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>
    </Router>
  );
}
