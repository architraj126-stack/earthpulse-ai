import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ExternalLink, ShieldCheck, Database, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#071426] border-t border-[#1E3A56] text-[#9BAEC2] text-sm pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-[#00D4FF]" />
              <span className="text-lg font-bold text-white tracking-tight">EarthPulse AI</span>
            </div>
            <p className="text-xs text-[#9BAEC2] leading-relaxed">
              AI-powered Earth Science trend detection and visualization platform synthesizing real NASA satellite observations and reanalysis models.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#35D07F]">
              <ShieldCheck className="w-4 h-4" />
              <span>Grounded in WMO & IPCC AR6 Standards</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-[#00D4FF] transition">Main Analytics Dashboard</Link></li>
              <li><Link to="/compare" className="hover:text-[#00D4FF] transition">Regional Trend Comparison</Link></li>
              <li><Link to="/knowledge" className="hover:text-[#00D4FF] transition">Scientific Knowledge Base</Link></li>
              <li><Link to="/about" className="hover:text-[#00D4FF] transition">Statistical Methodology</Link></li>
            </ul>
          </div>

          {/* NASA & Open Science Data Sources */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Data Attributions</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="https://power.larc.nasa.gov/" target="_blank" rel="noreferrer" className="hover:text-[#00D4FF] transition flex items-center gap-1">
                  NASA POWER Project <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/" target="_blank" rel="noreferrer" className="hover:text-[#00D4FF] transition flex items-center gap-1">
                  NASA GMAO MERRA-2 <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://ceres.larc.nasa.gov/" target="_blank" rel="noreferrer" className="hover:text-[#00D4FF] transition flex items-center gap-1">
                  NASA CERES Radiometry <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://modis.gsfc.nasa.gov/" target="_blank" rel="noreferrer" className="hover:text-[#00D4FF] transition flex items-center gap-1">
                  NASA MODIS Land Products <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://gpm.nasa.gov/" target="_blank" rel="noreferrer" className="hover:text-[#00D4FF] transition flex items-center gap-1">
                  NASA GPM / IMERG Rainfall <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Core Answering Questions */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Core Scientific Mission</h4>
            <p className="text-xs text-[#9BAEC2] mb-2 leading-relaxed">
              Answering the four foundational questions of environmental observation:
            </p>
            <div className="space-y-1 text-[11px] font-mono text-[#00D4FF]">
              <div>1. WHAT is changing?</div>
              <div>2. WHERE is it changing?</div>
              <div>3. HOW MUCH is it changing?</div>
              <div>4. IS the trend statistically significant?</div>
            </div>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="border-t border-[#1E3A56] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 EarthPulse AI. Developed for live Hackathon Demonstration.</p>
          <p className="text-gray-400">
            Data provided by NASA Langley Research Center & Global Modeling and Assimilation Office.
          </p>
        </div>
      </div>
    </footer>
  );
}
