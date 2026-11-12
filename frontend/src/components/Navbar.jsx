import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Search, Layers, GitCompare, BookOpen, History, Compass, Sun, Moon } from 'lucide-react';
import { getHealth } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import HistoryDrawer from './HistoryDrawer';

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [gatewayStatus, setGatewayStatus] = useState('checking'); // 'online' | 'slow' | 'offline'
  const [latency, setLatency] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    const t0 = performance.now();
    getHealth()
      .then(() => {
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
    { name: 'Atlas', path: '/atlas', icon: Layers },
    { name: 'Compare', path: '/compare', icon: GitCompare },
    { name: 'Cases', path: '/cases', alias: '/detective', icon: Compass },
    { name: 'Learn', path: '/learn', alias: '/knowledge', icon: BookOpen }
  ];

  const statusDotColor =
    gatewayStatus === 'online'
      ? 'var(--sig)'
      : gatewayStatus === 'slow'
      ? 'var(--warn)'
      : 'var(--warm)';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--panel)] border-b border-[var(--border)]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="EarthPulse AI Home">
            <div className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-[var(--card-subtle)] border border-[var(--border)] group-hover:border-[var(--accent)] transition-colors">
              <Globe className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold tracking-tight text-[var(--text)]">
                  EarthPulse
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--card-subtle)] text-[var(--accent)] border border-[var(--border)]">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-[var(--muted)] font-mono hidden md:block mt-0.5">
                NASA Climate Observatory
              </p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="flex items-center gap-1 overflow-x-auto" aria-label="Primary Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                location.pathname === link.path || (link.alias && location.pathname === link.alias);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--card-subtle)]'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle (Light / Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Terra theme' : 'Switch to Dark Terra theme'}
              title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--card-subtle)] hover:border-[var(--accent)] text-[var(--text)] text-xs font-medium border border-[var(--border)] transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
              )}
              <span className="hidden lg:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {/* History Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              aria-label="Open analysis history drawer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--card-subtle)] hover:border-[var(--accent)] text-[var(--text)] text-xs font-medium border border-[var(--border)] transition-colors"
            >
              <History className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
              <span className="hidden sm:inline">History</span>
            </button>

            {/* Live Engine Status Pill */}
            <div
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--card-subtle)] border border-[var(--border)] text-[11px] font-mono text-[var(--muted)]"
              title="NASA POWER & Backend Service Status"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: statusDotColor }}
                aria-hidden="true"
              />
              <span>
                {gatewayStatus === 'online' && `API ${latency || 90}ms`}
                {gatewayStatus === 'slow' && `Slow (${latency}ms)`}
                {gatewayStatus === 'offline' && 'Demo Mode'}
                {gatewayStatus === 'checking' && 'Connecting'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </>
  );
}
