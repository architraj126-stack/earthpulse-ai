import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  ArrowRight,
  TrendingUp,
  MapPin,
  FileText,
  Sparkles,
  Database,
  Activity,
  Layers,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Compass,
  BarChart3
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#071426] text-white selection:bg-[#00D4FF] selection:text-[#071426]">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-[#1E3A56]">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#00D4FF]/10 to-[#35D07F]/10 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#13263A] border border-[#00D4FF]/30 text-xs text-[#00D4FF] font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#35D07F] animate-ping"></span>
                <span>NASA Earth Science Trend Detection Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Discover What Is <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#35D07F]">Changing</span> on Our Planet.
              </h1>

              <p className="text-base sm:text-lg text-[#9BAEC2] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Explore NASA Earth science data, uncover environmental trends, and understand the changes shaping our planet.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/investigate"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#0099FF] text-[#071426] font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:brightness-110 transition shadow-[0_0_25px_rgba(0,212,255,0.35)] active:scale-95"
                >
                  <span>Start Exploring</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <a
                  href="#features"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#13263A] hover:bg-[#1E3A56] text-white font-semibold text-sm sm:text-base border border-[#1E3A56] flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <span>Explore Features</span>
                </a>
              </div>

              {/* Four Foundational Questions Pill Bar */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
                {[
                  { q: 'WHAT', desc: 'is changing?' },
                  { q: 'WHERE', desc: 'is it changing?' },
                  { q: 'HOW MUCH', desc: 'is it changing?' },
                  { q: 'IS IT', desc: 'statistically significant?' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#0D1B2A] border border-[#1E3A56] p-2.5 rounded-lg">
                    <span className="text-[10px] font-mono font-bold text-[#00D4FF] block">{item.q}</span>
                    <span className="text-xs text-white font-medium">{item.desc}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Visual: Interactive Planet & Live Telemetry Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
                
                {/* Glowing Orbit Rings */}
                <div className="absolute inset-0 rounded-full border border-[#00D4FF]/20 animate-spin-slow" />
                <div className="absolute inset-4 rounded-full border border-dashed border-[#35D07F]/25 animate-reverse-spin" />
                <div className="absolute inset-8 rounded-full border border-[#00D4FF]/10" />

                {/* Central Stylized Earth Sphere */}
                <div className="relative w-56 h-56 rounded-full bg-gradient-to-tr from-[#0D1B2A] via-[#13263A] to-[#0A2540] border-2 border-[#00D4FF]/50 shadow-[0_0_50px_rgba(0,212,255,0.3)] flex items-center justify-center overflow-hidden">
                  <Globe className="w-36 h-36 text-[#00D4FF]/40 animate-pulse" />
                  
                  {/* Internal Grid Lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#00D4FF_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                  
                  <div className="absolute text-center">
                    <span className="text-xs font-mono font-extrabold text-white tracking-widest block">EARTHPULSE</span>
                    <span className="text-[10px] font-mono text-[#35D07F]">LIVE ENGINE</span>
                  </div>
                </div>

                {/* Floating Telemetry Badge 1 */}
                <div className="absolute -top-2 right-0 bg-[#071426]/90 backdrop-blur-md border border-[#1E3A56] p-3 rounded-xl shadow-xl text-left space-y-0.5 animate-bounce-slow">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#9BAEC2]">
                    <Activity className="w-3 h-3 text-[#35D07F]" />
                    <span>Bengaluru Warming</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white">+0.026 °C / Year</div>
                  <div className="text-[9px] text-[#35D07F]">p = 0.001 (Significant)</div>
                </div>

                {/* Floating Telemetry Badge 2 */}
                <div className="absolute -bottom-3 left-0 bg-[#071426]/90 backdrop-blur-md border border-[#1E3A56] p-3 rounded-xl shadow-xl text-left space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#9BAEC2]">
                    <Database className="w-3 h-3 text-[#00D4FF]" />
                    <span>NASA POWER Archive</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white">1981–Present</div>
                  <div className="text-[9px] text-[#9BAEC2]">MERRA-2 Reanalysis</div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATISTICS & CAPABILITIES SECTION */}
      <section className="py-12 bg-[#0D1B2A] border-b border-[#1E3A56]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="p-4 rounded-xl bg-[#13263A] border border-[#1E3A56] text-center space-y-1">
              <div className="text-3xl font-extrabold text-[#00D4FF] font-mono">5+ Core</div>
              <div className="text-xs font-semibold text-white">Environmental Variables</div>
              <p className="text-[11px] text-[#9BAEC2]">Temperature, Rainfall, Humidity, Wind & Solar</p>
            </div>

            <div className="p-4 rounded-xl bg-[#13263A] border border-[#1E3A56] text-center space-y-1">
              <div className="text-3xl font-extrabold text-[#35D07F] font-mono">Global</div>
              <div className="text-xs font-semibold text-white">Location Analysis</div>
              <p className="text-[11px] text-[#9BAEC2]">Any geographic coordinate (-90° to +90°)</p>
            </div>

            <div className="p-4 rounded-xl bg-[#13263A] border border-[#1E3A56] text-center space-y-1">
              <div className="text-3xl font-extrabold text-[#00D4FF] font-mono">Rigorous</div>
              <div className="text-xs font-semibold text-white">Statistical Trend Testing</div>
              <p className="text-[11px] text-[#9BAEC2]">Mann-Kendall, Sen's Slope, OLS & Seasonal MK</p>
            </div>

            <div className="p-4 rounded-xl bg-[#13263A] border border-[#1E3A56] text-center space-y-1">
              <div className="text-3xl font-extrabold text-[#35D07F] font-mono">40+ Years</div>
              <div className="text-xs font-semibold text-white">Historical Exploration</div>
              <p className="text-[11px] text-[#9BAEC2]">Daily & monthly time-series from 1981 onwards</p>
            </div>

          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES SECTION */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#00D4FF] uppercase tracking-wider">
            Enterprise Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for Scientific Rigor & Clear Understanding
          </h2>
          <p className="text-sm sm:text-base text-[#9BAEC2]">
            EarthPulse AI bridges raw space agency telemetry and actionable environmental intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-[#13263A] border border-[#1E3A56] p-6 rounded-2xl space-y-3 hover:border-[#00D4FF]/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] flex items-center justify-center border border-[#00D4FF]/20 group-hover:scale-105 transition">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">NASA Data Integration</h3>
            <p className="text-xs text-[#9BAEC2] leading-relaxed">
              Direct connection to NASA POWER REST API synthesizing MERRA-2 atmospheric assimilation and CERES FLASHFlux satellite radiometry.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#13263A] border border-[#1E3A56] p-6 rounded-2xl space-y-3 hover:border-[#00D4FF]/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-[#35D07F]/10 text-[#35D07F] flex items-center justify-center border border-[#35D07F]/20 group-hover:scale-105 transition">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Interactive Global Mapping</h3>
            <p className="text-xs text-[#9BAEC2] leading-relaxed">
              Leaflet and OpenStreetMap integration allowing location search, map click-to-pick coordinates, and preset metropolitan centers.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#13263A] border border-[#1E3A56] p-6 rounded-2xl space-y-3 hover:border-[#00D4FF]/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] flex items-center justify-center border border-[#00D4FF]/20 group-hover:scale-105 transition">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Historical Trend Analysis</h3>
            <p className="text-xs text-[#9BAEC2] leading-relaxed">
              Interactive Recharts visualizations distinguishing actual observations from calculated linear regression trendlines.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#13263A] border border-[#1E3A56] p-6 rounded-2xl space-y-3 hover:border-[#35D07F]/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-[#35D07F]/10 text-[#35D07F] flex items-center justify-center border border-[#35D07F]/20 group-hover:scale-105 transition">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Statistical Significance Testing</h3>
            <p className="text-xs text-[#9BAEC2] leading-relaxed">
              Calculates Mann-Kendall p-value, Kendall Tau, Sen's slope, and 95% confidence intervals to evaluate real trends vs. random noise.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-[#13263A] border border-[#1E3A56] p-6 rounded-2xl space-y-3 hover:border-[#00D4FF]/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] flex items-center justify-center border border-[#00D4FF]/20 group-hover:scale-105 transition">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Scientific Explanation</h3>
            <p className="text-xs text-[#9BAEC2] leading-relaxed">
              "Ask EarthPulse AI" grounded assistant interprets results using our 28 indexed climate science and research documents.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-[#13263A] border border-[#1E3A56] p-6 rounded-2xl space-y-3 hover:border-[#35D07F]/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-[#35D07F]/10 text-[#35D07F] flex items-center justify-center border border-[#35D07F]/20 group-hover:scale-105 transition">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Automated Reports & CSV</h3>
            <p className="text-xs text-[#9BAEC2] leading-relaxed">
              Generate downloadable publication-grade PDF scientific reports via ReportLab alongside raw time-series CSV data exports.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 bg-[#0D1B2A] border-y border-[#1E3A56]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#00D4FF] uppercase tracking-wider">Simple 4-Step Journey</span>
            <h2 className="text-3xl font-extrabold text-white">How EarthPulse AI Operates</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Select Variables & Location',
                desc: 'Pick from temperature, rain, humidity, wind or solar, and pinpoint any city or coordinate.'
              },
              {
                step: '02',
                title: 'Retrieve NASA Data',
                desc: 'Queries NASA POWER daily or monthly point endpoints with automatic caching and cleaning.'
              },
              {
                step: '03',
                title: 'Calculate Trends & Significance',
                desc: 'Executes OLS linear regression, Sen’s slope, and Mann-Kendall non-parametric significance testing.'
              },
              {
                step: '04',
                title: 'AI Explanation & Reports',
                desc: 'Receive grounded scientific answers from EarthPulse AI and export one-click PDF/CSV reports.'
              }
            ].map((st) => (
              <div key={st.step} className="bg-[#13263A] border border-[#1E3A56] p-5 rounded-xl relative space-y-2">
                <span className="text-3xl font-extrabold font-mono text-[#00D4FF]/30">{st.step}</span>
                <h4 className="font-bold text-white text-sm">{st.title}</h4>
                <p className="text-xs text-[#9BAEC2] leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NASA DATA SOURCES SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#35D07F] uppercase tracking-wider">Trusted Scientific Authorities</span>
          <h2 className="text-3xl font-extrabold text-white">Connected Earth Observation Systems</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'NASA POWER', desc: 'Solar & Meteorology' },
            { name: 'NASA MERRA-2', desc: 'Atmospheric Reanalysis' },
            { name: 'NASA CERES', desc: 'Earth Radiation Budget' },
            { name: 'NASA MODIS', desc: 'Vegetation & LST' },
            { name: 'NASA GPM', desc: 'IMERG Global Rainfall' },
            { name: 'IPCC & WMO', desc: 'Climate Assessment' }
          ].map((src, i) => (
            <div key={i} className="bg-[#13263A] border border-[#1E3A56] p-3.5 rounded-xl text-center space-y-1">
              <div className="font-bold text-white text-xs">{src.name}</div>
              <div className="text-[10px] text-[#9BAEC2]">{src.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-16 bg-gradient-to-b from-[#0D1B2A] to-[#071426] border-t border-[#1E3A56]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to explore environmental changes in your region?
          </h2>
          <p className="text-sm sm:text-base text-[#9BAEC2] max-w-xl mx-auto">
            Select an environmental variable, choose a location on the interactive map, and uncover statistically verified trends today.
          </p>
          <div className="pt-2">
            <Link
              to="/investigate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#35D07F] text-[#071426] font-bold text-base hover:brightness-110 transition shadow-[0_0_30px_rgba(0,212,255,0.4)] active:scale-95"
            >
              <span>Launch EarthPulse Dashboard</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
