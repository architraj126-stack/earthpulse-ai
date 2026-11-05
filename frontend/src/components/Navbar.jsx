import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Search, Layers, GitCompare, BookOpen, History, ArrowRight, Compass } from 'lucide-react';
import { getHealth } from '../services/api';
import HistoryDrawer from './HistoryDrawer';

export default function Navbar() {
  const location = useLocation();
  const [gatewayStatus, setGatewayStatus] = useState('checking'); // 'online' | 'slow' | 'offline'
  const [latency, setLatency] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    const t0 = performance.now();
    getHealth()
      .then(res => {
        const elapsed = Math.round(performance.now() - t0);
        setLatency(elapsed);
        if (elapsed > 1500) {
          setGatewayStatus('slow');
        } else {
          setGatewayStatus('online');
        }
      })
      .catch(() => {
        setGatewayStatus('offline');
      });
  }, []);

  const navLinks = [
    { name: 'Investigate', path: '/investigate', alias: '/dashboard', icon: Search },
    { name: 'Cases', path: '/cases', alias: '/detective', icon: Compass },
    { name: 'Atlas', path: '/atlas', icon: Layers },
    { name: 'Compare', path: '/compare', icon: GitCompare },
    { name: 'Learn', path: '/learn', alias: '/knowledge', icon: BookOpen },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#071426]/95 border-b border-[#1E3A56]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0D1B2A] to-[#13263A] border border-[#00D4FF]/40 group-hover:border-[#00D4FF] transition shadow-[0_0_15px_rgba(0,212,255,0.2)]">
              <Globe className="w-5 h-5 text-[#00D4FF] group-hover:scale-105 transition" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35D07F] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#35D07F]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-white font-heading group-hover:text-[#00D4FF] transition">
                  EarthPulse
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide -mt-0.5 hidden sm:block">
                NASA Earth Science Intelligence
              </p>
            </div>
          </Link>

          {/* Center Navigation Links: Investigate, Atlas, Compare, Learn */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (link.alias && location.pathname === link.alias);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#13263A] text-[#00D4FF] border border-[#00D4FF]/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#0D1B2A]'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* History Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D1B2A] hover:bg-[#13263A] text-slate-300 hover:text-white text-xs font-semibold border border-[#1E3A56] transition"
              title="Open Analysis History Drawer"
            >
              <History className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span className="hidden sm:inline">History</span>
            </button>

            {/* Live Engine Status with Latency */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0D1B2A] border border-[#1E3A56] text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${
                gatewayStatus === 'online'
                  ? 'bg-[#35D07F] shadow-[0_0_8px_#35D07F]'
                  : gatewayStatus === 'slow'
                  ? 'bg-amber-400 shadow-[0_0_8px_#F59E0B]'
                  : 'bg-[#FF4D4D] shadow-[0_0_8px_#FF4D4D]'
              }`} />
              <span className="text-slate-300">
                {gatewayStatus === 'online' && `NASA Live (${latency || 120}ms)`}
                {gatewayStatus === 'slow' && `NASA Slow (${latency}ms)`}
                {gatewayStatus === 'offline' && 'Offline (Demo Fallback)'}
                {gatewayStatus === 'checking' && 'Connecting...'}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* History Slide-Over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </>
  );
}
