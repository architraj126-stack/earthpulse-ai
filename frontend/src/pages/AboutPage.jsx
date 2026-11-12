import React from 'react';
import { Globe, Code2, ShieldCheck, Activity } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2 border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--accent)]">
          <Globe className="w-4 h-4" aria-hidden="true" />
          <span>Scientific Mission &amp; Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] tracking-tight">
          About EarthPulse AI
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
          An Earth Science trend detection and visualization workbench built to empower students, researchers, and policymakers to inspect environmental shifts using NASA satellite observations.
        </p>
      </div>

      {/* Four Core Questions */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[14px] p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[var(--accent)]" aria-hidden="true" />
          <span>The Four Fundamental Environmental Questions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {[
            {
              title: '1. WHAT is changing?',
              body: 'Surface air temperature (T2M), corrected precipitation (PRECTOTCORR), relative humidity (RH2M), boundary-layer wind (WS2M), and solar irradiance (ALLSKY_SFC_SW_DWN).',
              color: 'var(--warm)'
            },
            {
              title: '2. WHERE is it changing?',
              body: 'Point and regional analysis across global WGS-84 coordinates (-90° to +90°), surfacing opposite regional directions.',
              color: 'var(--accent)'
            },
            {
              title: '3. HOW MUCH is it changing?',
              body: "Quantified via non-parametric Sen's slope (per decade and total period change) alongside OLS regression intervals.",
              color: 'var(--cool)'
            },
            {
              title: '4. IS the trend significant?',
              body: 'Evaluated with Mann-Kendall, Seasonal MK, lag-1 serial autocorrelation correction, and Pettitt change-point testing at 95% confidence.',
              color: 'var(--sig)'
            }
          ].map((q) => (
            <div
              key={q.title}
              className="bg-[var(--panel)] p-4 rounded-[12px] border border-[var(--border)] space-y-1"
              style={{ borderLeftWidth: '3px', borderLeftColor: q.color }}
            >
              <span className="font-bold text-sm text-[var(--text)] block">{q.title}</span>
              <p className="text-[var(--muted)] leading-relaxed">{q.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[14px] p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
          <Code2 className="w-5 h-5 text-[var(--accent)]" aria-hidden="true" />
          <span>Technology Stack</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1 bg-[var(--panel)] p-4 rounded-[12px] border border-[var(--border)]">
            <h3 className="font-bold text-[var(--text)] text-sm">Frontend</h3>
            <ul className="text-[var(--muted)] space-y-1 pt-1">
              <li>• React 18 &amp; Vite</li>
              <li>• Tailwind CSS (Terra Tokens)</li>
              <li>• Recharts Time-Series Workbench</li>
              <li>• React Leaflet GeoJSON Choropleth</li>
              <li>• Lucide React Icons</li>
            </ul>
          </div>

          <div className="space-y-1 bg-[var(--panel)] p-4 rounded-[12px] border border-[var(--border)]">
            <h3 className="font-bold text-[var(--text)] text-sm">Backend &amp; Analytics</h3>
            <ul className="text-[var(--muted)] space-y-1 pt-1">
              <li>• Python &amp; FastAPI</li>
              <li>• Pandas &amp; NumPy</li>
              <li>• SciPy (OLS, t-dist, Theil-Sen)</li>
              <li>• PyMannKendall (MK &amp; Seasonal MK)</li>
              <li>• SQLite History &amp; NASA Cache</li>
            </ul>
          </div>

          <div className="space-y-1 bg-[var(--panel)] p-4 rounded-[12px] border border-[var(--border)]">
            <h3 className="font-bold text-[var(--text)] text-sm">Scientific Reports &amp; RAG</h3>
            <ul className="text-[var(--muted)] space-y-1 pt-1">
              <li>• ReportLab PDF Engine</li>
              <li>• Raw CSV Data Exporter</li>
              <li>• BM25 Knowledge Base RAG</li>
              <li>• 28 Indexed Scientific Docs</li>
              <li>• WMO &amp; IPCC AR6 Guidance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Attribution */}
      <div className="bg-[var(--panel)] border border-[var(--border)] rounded-[14px] p-6 space-y-3 text-xs text-[var(--muted)]">
        <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" style={{ color: 'var(--sig)' }} aria-hidden="true" />
          <span>Scientific Attributions &amp; Citations</span>
        </h3>
        <p className="leading-relaxed">
          NASA POWER datasets are provided courtesy of the NASA Langley Research Center (LaRC) POWER Project funded by the NASA Earth Science Applied Sciences Program. Atmospheric assimilations derive from NASA GMAO MERRA-2 reanalysis and NASA CERES radiometry.
        </p>
        <p className="leading-relaxed">
          Statistical methodology adheres to World Meteorological Organization (WMO-No. 1100) Guidelines on Climate Extremes and IPCC Sixth Assessment Report (AR6) guidance on detection and attribution.
        </p>
      </div>
    </div>
  );
}
