import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  ArrowRight,
  TrendingUp,
  Database,
  Activity,
  Sparkles,
  FileText,
  Compass
} from 'lucide-react';
import { TrendArrow, SignificanceBadge } from '../components/ui';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* HERO SECTION: Leads with the Four Foundational Questions + CTA to /investigate */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-24 border-b border-[var(--border)] bg-[var(--panel)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--card-subtle)] border border-[var(--border)] text-xs font-mono text-[var(--muted)]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--sig)' }} aria-hidden="true" />
                <span>NASA Earth Science Trend Observatory</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--text)] leading-[1.12]">
                Four Questions to Understand Our Changing Planet.
              </h1>

              <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl leading-relaxed">
                Select NASA satellite variables, explore historical records across global regions, quantify rates of change, and test statistical significance—without guesswork.
              </p>

              {/* Four Foundational Questions Leading Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  {
                    tag: '01 · WHAT',
                    question: 'What is changing?',
                    desc: 'Temperature, rainfall, humidity, surface wind, and solar irradiance from NASA POWER.',
                    accent: 'var(--warm)'
                  },
                  {
                    tag: '02 · WHERE',
                    question: 'Where is it shifting?',
                    desc: 'Drop a pin anywhere on Earth and uncover regions trending in opposite directions.',
                    accent: 'var(--accent)'
                  },
                  {
                    tag: '03 · HOW MUCH',
                    question: 'How fast is the change?',
                    desc: "Decadal rates quantified via non-parametric Sen's slope and total historical delta.",
                    accent: 'var(--cool)'
                  },
                  {
                    tag: '04 · SIGNIFICANT?',
                    question: 'Is it statistically real?',
                    desc: 'Mann-Kendall, Seasonal MK, autocorrelation adjustment, and Pettitt shift tests.',
                    accent: 'var(--sig)'
                  }
                ].map((item) => (
                  <div
                    key={item.tag}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-[14px] p-3.5 space-y-1"
                    style={{ borderLeftWidth: '3px', borderLeftColor: item.accent }}
                  >
                    <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--muted)]">
                      {item.tag}
                    </div>
                    <div className="text-sm font-bold text-[var(--text)]">{item.question}</div>
                    <p className="text-xs text-[var(--muted)] leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/investigate"
                  className="px-6 py-3 rounded-[12px] bg-[var(--accent)] text-[var(--accent-fg)] font-bold text-sm inline-flex items-center gap-2 hover:opacity-95 transition-opacity"
                >
                  <span>Open Mission Control</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <Link
                  to="/atlas"
                  className="px-5 py-3 rounded-[12px] bg-[var(--card)] hover:border-[var(--accent)] text-[var(--text)] font-semibold text-sm border border-[var(--border)] inline-flex items-center gap-2 transition-colors"
                >
                  <span>Explore Global Atlas</span>
                </Link>

                <Link
                  to="/compare"
                  className="px-5 py-3 rounded-[12px] bg-[var(--card)] hover:border-[var(--accent)] text-[var(--text)] font-semibold text-sm border border-[var(--border)] inline-flex items-center gap-2 transition-colors"
                >
                  <span>Trend Matrix</span>
                </Link>
              </div>
            </div>

            {/* Right Visual: Clean Live Verdict Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[14px] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                      Sample Observatory Verdict
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--muted)]">1990–2023</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-[12px] bg-[var(--panel)] border border-[var(--border)] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[var(--text)]">Bengaluru · Air Temperature (T2M)</div>
                      <div className="text-[11px] text-[var(--muted)] font-mono">12.97°N, 77.59°E</div>
                    </div>
                    <TrendArrow value={0.26} unit="°C/dec" decimals={2} isSignificant={true} className="text-sm" />
                  </div>

                  <div className="p-3.5 rounded-[12px] bg-[var(--panel)] border border-[var(--border)] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[var(--text)]">Greenland · Arctic Amplification</div>
                      <div className="text-[11px] text-[var(--muted)] font-mono">72.00°N, 40.00°W</div>
                    </div>
                    <TrendArrow value={0.58} unit="°C/dec" decimals={2} isSignificant={true} className="text-sm" />
                  </div>

                  <div className="p-3.5 rounded-[12px] bg-[var(--panel)] border border-[var(--border)] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[var(--text)]">Central Sahel · Precipitation</div>
                      <div className="text-[11px] text-[var(--muted)] font-mono">14.50°N, 14.45°E</div>
                    </div>
                    <TrendArrow value={-0.08} unit="mm/dec" decimals={2} isSignificant={false} className="text-sm" />
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
                  <SignificanceBadge isSignificant={true} adjusted={true} />
                  <span className="font-mono">MERRA-2 · CERES</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES SUMMARY STRIP */}
      <section className="py-10 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: '5 Core', title: 'Environmental Variables', sub: 'Temp, Rain, Humidity, Wind & Solar' },
            { num: 'Global', title: 'Location Coverage', sub: 'Any coordinate (-90° to +90°)' },
            { num: '4 Tests', title: 'Statistical Rigor', sub: "Mann-Kendall, Sen's, Pettitt, Lag-1 AC" },
            { num: '40+ Yrs', title: 'Historical Archive', sub: 'Daily & monthly series from 1981' }
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-[14px] bg-[var(--card)] border border-[var(--border)] space-y-1">
              <div className="text-2xl font-extrabold font-mono text-[var(--accent)] tracking-tight">{stat.num}</div>
              <div className="text-xs font-bold text-[var(--text)]">{stat.title}</div>
              <p className="text-[11px] text-[var(--muted)]">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORM FEATURES SECTION */}
      <section id="features" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
            Scientific Workbench
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
            Built for Transparency &amp; Statistical Clarity
          </h2>
          <p className="text-sm text-[var(--muted)]">
            EarthPulse AI connects satellite telemetry directly with reproducible non-parametric diagnostics and grounded science explanations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Database,
              title: 'NASA POWER Integration',
              desc: 'Direct queries to NASA Langley POWER synthesizing MERRA-2 reanalysis and CERES radiometry.'
            },
            {
              icon: Compass,
              title: 'Global Choropleth & Pins',
              desc: 'Explore 5° global trend patterns, spot opposite trends nearby, or drop pins anywhere on Earth.'
            },
            {
              icon: TrendingUp,
              title: 'Multi-Layer Time Series',
              desc: "Inspect raw monthly series, 12-month rolling averages, Sen's trendline, 95% CI, and change-points."
            },
            {
              icon: Activity,
              title: 'Significance & Autocorrelation',
              desc: 'Calculates Mann-Kendall p-values with Hamed-Rao style serial correlation checks at 95% confidence.'
            },
            {
              icon: Sparkles,
              title: 'Grounded Science Assistant',
              desc: 'BM25 retrieval over 28 curated NASA, WMO, and IPCC AR6 documentation files.'
            },
            {
              icon: FileText,
              title: 'PDF Reports & CSV Exports',
              desc: 'Generate clean ReportLab scientific PDF reports and raw observation CSV files in one click.'
            }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-[14px] space-y-2.5"
              >
                <div className="w-10 h-10 rounded-[10px] bg-[var(--card-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-[var(--text)]">{feat.title}</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-14 bg-[var(--panel)] border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
            Ready to investigate environmental trends?
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Launch Mission Control to test any variable and location, or step through verified Detective Cases.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/investigate"
              className="px-6 py-3 rounded-[12px] bg-[var(--accent)] text-[var(--accent-fg)] font-bold text-sm inline-flex items-center gap-2"
            >
              <span>Start Investigating</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/cases"
              className="px-6 py-3 rounded-[12px] bg-[var(--card)] border border-[var(--border)] text-[var(--text)] font-semibold text-sm hover:border-[var(--accent)]"
            >
              Explore Detective Cases
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
