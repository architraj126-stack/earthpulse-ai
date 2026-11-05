import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Activity, BarChart2, GitCompare, BookOpen, Info, ArrowRight, ShieldCheck } from 'lucide-react';
import { getHealth } from '../services/api';

export default function Navbar() {
  const location = useLocation();
  const [healthy, setHealthy] = useState(null);

  useEffect(() => {
    getHealth()
      .then(res => setHealthy(res.status === 'healthy'))
      .catch(() => setHealthy(false));
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart2 },
    { name: 'Regional Comparison', path: '/compare', icon: GitCompare },
    { name: 'Knowledge Base', path: '/knowledge', icon: BookOpen },
    { name: 'About & Methods', path: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#071426]/90 backdrop-blur-md border-b border-[#1E3A56]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0D1B2A] to-[#13263A] border border-[#00D4FF]/40 group-hover:border-[#00D4FF] transition shadow-[0_0_15px_rgba(0,212,255,0.2)]">
            <Globe className="w-6 h-6 text-[#00D4FF] animate-spin-slow group-hover:scale-105 transition" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35D07F] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#35D07F]"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-[#00D4FF] transition">
                EarthPulse
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[10px] text-[#9BAEC2] tracking-wide -mt-0.5 hidden sm:block">
              NASA Earth Science Intelligence
            </p>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#13263A] text-[#00D4FF] border border-[#00D4FF]/30 shadow-sm'
                    : 'text-[#9BAEC2] hover:text-white hover:bg-[#0D1B2A]'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 opacity-80" />}
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action & API Status */}
        <div className="flex items-center gap-3">
          {/* Live Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0D1B2A] border border-[#1E3A56] text-[11px] text-[#9BAEC2]">
            <span className={`w-2 h-2 rounded-full ${healthy ? 'bg-[#35D07F] shadow-[0_0_8px_#35D07F]' : 'bg-[#FF4D4D]'}`}></span>
            <span>{healthy ? 'NASA Engine Online' : 'Connecting Engine...'}</span>
          </div>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00D4FF] to-[#0099FF] text-[#071426] font-semibold text-sm hover:brightness-110 transition shadow-[0_0_15px_rgba(0,212,255,0.3)] active:scale-95"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </header>
  );
}
