import React from 'react';
import {
  Globe,
  Award,
  Layers,
  Code2,
  Database,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Activity
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#071426] text-white p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="space-y-2 border-b border-[#1E3A56] pb-6">
        <div className="flex items-center gap-2 text-xs text-[#00D4FF] font-semibold uppercase tracking-wider">
          <Globe className="w-4 h-4" />
          <span>Scientific Mission & Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          About EarthPulse AI
        </h1>
        <p className="text-sm sm:text-base text-[#9BAEC2] leading-relaxed">
          An AI-powered Earth Science trend detection and visualization platform built to empower students, researchers, scientists, and the general public to understand environmental changes using NASA satellite observations.
        </p>
      </div>

      {/* The Four Core Questions */}
      <div className="bg-[#13263A] border border-[#1E3A56] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#00D4FF]" />
          <span>The Four Fundamental Environmental Questions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#0D1B2A] p-4 rounded-xl border border-[#1E3A56] space-y-1">
            <span className="font-bold text-[#00D4FF] text-sm">1. WHAT is changing?</span>
            <p className="text-[#9BAEC2]">
              Surface air temperatures (T2M), total precipitation (PRECTOTCORR), relative humidity (RH2M), boundary-layer wind speed (WS2M), and solar irradiance (ALLSKY_SFC_SW_DWN).
            </p>
          </div>
          <div className="bg-[#0D1B2A] p-4 rounded-xl border border-[#1E3A56] space-y-1">
            <span className="font-bold text-[#35D07F] text-sm">2. WHERE is it changing?</span>
            <p className="text-[#9BAEC2]">
              Point and regional analysis globally across WGS-84 coordinates (-90° to +90° latitude), with initial demonstration benchmarked on Bengaluru, Karnataka.
            </p>
          </div>
          <div className="bg-[#0D1B2A] p-4 rounded-xl border border-[#1E3A56] space-y-1">
            <span className="font-bold text-[#00D4FF] text-sm">3. HOW MUCH is it changing?</span>
            <p className="text-[#9BAEC2]">
              Quantified via Sen’s slope robust rate of change (annual and decadal units) and Ordinary Least Squares linear regression slope with 95% confidence intervals.
            </p>
          </div>
          <div className="bg-[#0D1B2A] p-4 rounded-xl border border-[#1E3A56] space-y-1">
            <span className="font-bold text-[#35D07F] text-sm">4. IS the trend statistically significant?</span>
            <p className="text-[#9BAEC2]">
              Evaluated with the non-parametric Mann-Kendall test at α = 0.05, establishing whether directional changes exceed random sampling noise under the null hypothesis.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack & Architecture */}
      <div className="bg-[#13263A] border border-[#1E3A56] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-[#35D07F]" />
          <span>Technology Stack</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1 bg-[#0D1B2A] p-4 rounded-xl border border-[#1E3A56]">
            <h4 className="font-bold text-white text-sm">Frontend</h4>
            <ul className="text-[#9BAEC2] space-y-1 pt-1">
              <li>• React.js & Vite</li>
              <li>• Tailwind CSS (Deep Navy Theme)</li>
              <li>• Recharts (Interactive Time Series)</li>
              <li>• React Leaflet & OpenStreetMap</li>
              <li>• Lucide React Icons</li>
            </ul>
          </div>

          <div className="space-y-1 bg-[#0D1B2A] p-4 rounded-xl border border-[#1E3A56]">
            <h4 className="font-bold text-white text-sm">Backend & Analytics</h4>
            <ul className="text-[#9BAEC2] space-y-1 pt-1">
              <li>• Python & FastAPI</li>
              <li>• Pandas & NumPy</li>
              <li>• SciPy (OLS, t-dist, Theil-Sen)</li>
              <li>• PyMannKendall (MK & Seasonal MK)</li>
              <li>• SQLite (History & Cache)</li>
            </ul>
          </div>

          <div className="space-y-1 bg-[#0D1B2A] p-4 rounded-xl border border-[#1E3A56]">
            <h4 className="font-bold text-white text-sm">Scientific Reports & RAG</h4>
            <ul className="text-[#9BAEC2] space-y-1 pt-1">
              <li>• ReportLab PDF Engine</li>
              <li>• CSV Data Exporter</li>
              <li>• Knowledge Base RAG Assistant</li>
              <li>• 28 Indexed Scientific Docs</li>
              <li>• WMO & IPCC Compliant</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Scientific Data Attribution & Standards */}
      <div className="bg-[#0D1B2A] border border-[#1E3A56] rounded-2xl p-6 space-y-4 text-xs text-[#9BAEC2]">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#35D07F]" />
          <span>Scientific Attributions & Citations</span>
        </h3>
        <p className="leading-relaxed">
          NASA POWER datasets are provided courtesy of the NASA Langley Research Center (LaRC) POWER Project funded by the NASA Earth Science Applied Sciences Program. Atmospheric assimilations are derived from NASA Global Modeling and Assimilation Office (GMAO) MERRA-2 reanalysis. Solar radiative fluxes are produced by the NASA Clouds and the Earth's Radiant Energy System (CERES).
        </p>
        <p className="leading-relaxed">
          Statistical methodology adheres to World Meteorological Organization (WMO-No. 1100) Guidelines on Climate Extremes and IPCC Sixth Assessment Report (AR6) guidance on detection and attribution.
        </p>
      </div>

    </div>
  );
}
