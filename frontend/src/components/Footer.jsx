import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[var(--panel)] border-t border-[var(--border)] text-[var(--muted)] text-sm pt-10 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--accent)]" aria-hidden="true" />
              <span className="text-base font-bold text-[var(--text)] tracking-tight">EarthPulse AI</span>
            </div>
            <p className="text-xs leading-relaxed">
              Environmental trend detection and visualization workbench grounded in NASA satellite records and non-parametric statistics.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--sig)' }}>
              <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>WMO &amp; IPCC AR6 Compliant Methods</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-[var(--text)] font-semibold text-xs uppercase tracking-wider mb-3">Workbench</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/investigate" className="hover:text-[var(--accent)] transition-colors">Mission Control (/investigate)</Link></li>
              <li><Link to="/atlas" className="hover:text-[var(--accent)] transition-colors">Global Atlas (/atlas)</Link></li>
              <li><Link to="/compare" className="hover:text-[var(--accent)] transition-colors">Trend Matrix (/compare)</Link></li>
              <li><Link to="/cases" className="hover:text-[var(--accent)] transition-colors">Detective Cases (/cases)</Link></li>
              <li><Link to="/learn" className="hover:text-[var(--accent)] transition-colors">Knowledge Base (/learn)</Link></li>
            </ul>
          </div>

          {/* NASA & Open Science Data Sources */}
          <div>
            <h4 className="text-[var(--text)] font-semibold text-xs uppercase tracking-wider mb-3">Data Attributions</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="https://power.larc.nasa.gov/" target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1">
                  NASA POWER Project <ExternalLink className="w-3 h-3 opacity-60" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href="https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/" target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1">
                  NASA GMAO MERRA-2 <ExternalLink className="w-3 h-3 opacity-60" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href="https://ceres.larc.nasa.gov/" target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1">
                  NASA CERES Radiometry <ExternalLink className="w-3 h-3 opacity-60" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href="https://modis.gsfc.nasa.gov/" target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1">
                  NASA MODIS Land Products <ExternalLink className="w-3 h-3 opacity-60" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Core Questions */}
          <div>
            <h4 className="text-[var(--text)] font-semibold text-xs uppercase tracking-wider mb-3">Core Questions</h4>
            <div className="space-y-1.5 text-xs font-mono text-[var(--text)]">
              <div>1. WHAT is changing?</div>
              <div>2. WHERE is it happening?</div>
              <div>3. HOW MUCH has shifted?</div>
              <div>4. IS it statistically significant?</div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© 2026 EarthPulse AI · Terra Observatory Edition</p>
          <p>Data via NASA Langley Research Center POWER &amp; GMAO MERRA-2.</p>
        </div>
      </div>
    </footer>
  );
}
