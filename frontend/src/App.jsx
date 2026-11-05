import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ComparePage from './pages/ComparePage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#071426] text-white">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/knowledge" element={<KnowledgeBasePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}
