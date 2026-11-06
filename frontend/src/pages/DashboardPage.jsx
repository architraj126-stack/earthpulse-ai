import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Layers,
  TrendingUp,
  Sparkles,
  FileText,
  Download,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart2,
  Activity,
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  Sun,
  Share2,
  Check,
  RotateCcw,
  Info,
  Compass
} from 'lucide-react';
import {
  getVariables,
  analyzeTrend,
  getPdfReportUrl,
  getCsvExportUrl
} from '../services/api';
import MapWorkspace from '../components/map/MapWorkspace';
import TimeSeriesChart from '../components/TimeSeriesChart';
import YearlyChart from '../components/YearlyChart';
import SeasonalChart from '../components/SeasonalChart';
import AskEarthPulseSection from '../components/AskEarthPulseSection';

const VARIABLE_ICONS = {
  T2M: Thermometer,
  PRECTOTCORR: CloudRain,
  RH2M: Droplets,
  WS2M: Wind,
  ALLSKY_SFC_SW_DWN: Sun
};

export default function DashboardPage() {
  const routerLocation = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation / Preset routing if coming from URL query parameters or Atlas/preset navigation
  const initialVariable = searchParams.get('var') || routerLocation.state?.variable || 'T2M';
  const initialLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')) : (routerLocation.state?.latitude ?? 12.9716);
  const initialLon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')) : (routerLocation.state?.longitude ?? 77.5946);
  const initialLocName = searchParams.get('loc') || routerLocation.state?.locationName || 'Bengaluru, Karnataka';
  const initialStartYear = searchParams.get('start') ? parseInt(searchParams.get('start'), 10) : 1990;
  const initialEndYear = searchParams.get('end') ? parseInt(searchParams.get('end'), 10) : 2023;
  const initialFreq = searchParams.get('freq') || 'monthly';

  // 3-Step Flow Form State
  const [selectedVariable, setSelectedVariable] = useState(initialVariable);
  const [locationName, setLocationName] = useState(initialLocName);
  const [latitude, setLatitude] = useState(initialLat);
  const [longitude, setLongitude] = useState(initialLon);
  const [startYear, setStartYear] = useState(initialStartYear);
  const [endYear, setEndYear] = useState(initialEndYear);
  const [frequency, setFrequency] = useState(initialFreq);
  const [copiedLink, setCopiedLink] = useState(false);

  // App & Data States
  const [variables, setVariables] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [showExplainSection, setShowExplainSection] = useState(true);
  const [secondaryTab, setSecondaryTab] = useState('yearly');
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  // Load variables and trigger initial analysis
  useEffect(() => {
    getVariables()
      .then((vars) => setVariables(vars || []))
      .catch(() => {});

    // Initial analysis run
    runAnalysis({
      variable: initialVariable,
      latitude: initialLat,
      longitude: initialLon,
      location_name: initialLocName,
      start_date: `${startYear}-01-01`,
      end_date: `${endYear}-12-31`,
      frequency: 'monthly'
    });
  }, []);

  const runAnalysis = async (customPayload = null) => {
    setLoading(true);
    setError(null);

    const payload = customPayload || {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      location_name: locationName,
      variable: selectedVariable,
      start_date: `${startYear}-01-01`,
      end_date: `${endYear}-12-31`,
      frequency: frequency
    };

    // Keep URL query parameters synchronized (shareable read-only URL state)
    setSearchParams({
      var: payload.variable,
      lat: String(payload.latitude),
      lon: String(payload.longitude),
      loc: payload.location_name,
      start: String(startYear),
      end: String(endYear),
      freq: frequency
    }, { replace: true });

    try {
      const data = await analyzeTrend(payload);
      setAnalysisResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Analysis pipeline execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyShareableLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Map coordinate callback (updates state WITHOUT triggering analysis)
  const handleMapLocationChange = useCallback((name, lat, lon) => {
    setLocationName(name);
    setLatitude(lat);
    setLongitude(lon);
  }, []);

  const summary = analysisResult?.summary;
  const timeSeriesData = analysisResult?.data?.time_series || [];
  const yearlyData = analysisResult?.data?.yearly_averages || [];
  const monthlyData = analysisResult?.data?.monthly_variation || [];

  const activeVarMeta = variables.find((v) => v.parameter === selectedVariable) || {
    name: '2-Meter Air Temperature',
    unit: '°C',
    definition: 'Surface atmospheric air temperature at 2 meters above ground.'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
            Environmental Trend Investigation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            A 3-step scientific journey: choose your variable, select any location, set your time horizon, and analyze.
          </p>
        </div>

        {summary && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyShareableLink}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0D1B2A] hover:bg-[#13263A] text-slate-300 border border-[#1E3A56] text-xs font-semibold transition"
              title="Copy shareable link with current environmental parameters"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#00D4FF]" />
                  <span>Share Analysis</span>
                </>
              )}
            </button>

            <a
              href={getPdfReportUrl({
                latitude,
                longitude,
                location_name: locationName,
                variable: selectedVariable,
                start_date: `${startYear}-01-01`,
                end_date: `${endYear}-12-31`,
                frequency
              })}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0D1B2A] hover:bg-[#13263A] text-[#00D4FF] border border-[#1E3A56] text-xs font-semibold transition"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF</span>
            </a>

            <a
              href={getCsvExportUrl({
                latitude,
                longitude,
                location_name: locationName,
                variable: selectedVariable,
                start_date: `${startYear}-01-01`,
                end_date: `${endYear}-12-31`,
                frequency
              })}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0D1B2A] hover:bg-[#13263A] text-slate-300 border border-[#1E3A56] text-xs font-semibold transition"
            >
              <Download className="w-4 h-4" />
              <span>CSV Data</span>
            </a>
          </div>
        )}
      </div>

      {/* GUIDED 3-STEP FLOW WORKBENCH */}
      <div className="bg-[#0D1B2A] border border-[#1E3A56] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
        
        {/* STEP 1: What are you curious about? */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00D4FF] text-[#071426] text-xs font-bold font-mono">1</span>
            <h2 className="text-sm sm:text-base font-bold text-white font-heading">
              What environmental variable are you curious about?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {variables.map((v) => {
              const Icon = VARIABLE_ICONS[v.parameter] || Thermometer;
              const isSelected = selectedVariable === v.parameter;
              return (
                <button
                  key={v.parameter}
                  type="button"
                  onClick={() => setSelectedVariable(v.parameter)}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 relative ${
                    isSelected
                      ? 'bg-[#13263A] border-[#00D4FF] shadow-lg shadow-[#00D4FF]/20 ring-1 ring-[#00D4FF]'
                      : 'bg-[#13263A]/60 border-[#1E3A56] hover:border-slate-500 hover:bg-[#13263A]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#00D4FF] text-[#071426]' : 'bg-[#0D1B2A] text-[#00D4FF]'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold px-2 py-0.5 rounded bg-[#0D1B2A] border border-[#1E3A56]">
                      {v.unit}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white font-heading leading-tight">{v.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                      {v.definition}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Where? (Map Workspace with 390px Mobile Sheet) */}
        <div className="space-y-3 pt-4 border-t border-[#1E3A56]/60" role="region" aria-label="Geographic Location Selection">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00D4FF] text-[#071426] text-xs font-bold font-mono">2</span>
              <h2 className="text-sm sm:text-base font-bold text-white font-heading">
                Where? (Drop a pin, explore NASA Satellite, or view Global Atlas)
              </h2>
            </div>

            {/* Mobile Map Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileMapOpen(!mobileMapOpen)}
              className="sm:hidden flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#13263A] text-[#00D4FF] border border-[#1E3A56] text-xs font-semibold tap-target-44"
              aria-expanded={mobileMapOpen}
              aria-label="Toggle interactive map view on mobile"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{mobileMapOpen ? 'Collapse Map' : 'Open Map'}</span>
              {mobileMapOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <div className="text-xs font-mono text-[#00D4FF] hidden sm:block">
              Coordinates: {latitude.toFixed(2)}°, {longitude.toFixed(2)}°
            </div>
          </div>

          {/* Location Summary Pill on Mobile */}
          <div className="sm:hidden flex items-center justify-between text-xs font-mono text-slate-300 bg-[#13263A] px-3.5 py-2.5 rounded-xl border border-[#1E3A56]">
            <span className="truncate font-semibold text-white">{locationName}</span>
            <span className="text-[#00D4FF] shrink-0">[{latitude.toFixed(2)}°, {longitude.toFixed(2)}°]</span>
          </div>

          {/* Map Container: Collapsible on 390px mobile, fixed 460px on desktop */}
          <div className={`${mobileMapOpen ? 'block' : 'hidden sm:block'} h-[600px] sm:h-[640px] transition-all`}>
            <MapWorkspace
              locationName={locationName}
              latitude={latitude}
              longitude={longitude}
              onLocationChange={handleMapLocationChange}
              activeVariable={selectedVariable}
            />
          </div>
        </div>

        {/* STEP 3: When? (Period & Resolution) + Sticky Analyze Button */}
        <div className="space-y-4 pt-4 border-t border-[#1E3A56]/60">
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00D4FF] text-[#071426] text-xs font-bold font-mono">3</span>
            <h2 className="text-sm sm:text-base font-bold text-white font-heading">
              When? (Multi-decadal period: 1990 to {endYear})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-[#13263A] p-4 rounded-2xl border border-[#1E3A56]">
            {/* Start Year Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>Start Year: <b className="text-white font-mono">{startYear}</b></span>
                <span className="text-slate-400 font-mono">1981–2015</span>
              </div>
              <input
                type="range"
                min={1981}
                max={2015}
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
                className="w-full accent-[#00D4FF] h-2 bg-[#0D1B2A] rounded-lg cursor-pointer"
              />
            </div>

            {/* End Year Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>End Year: <b className="text-white font-mono">{endYear}</b></span>
                <span className="text-slate-400 font-mono">2000–2023</span>
              </div>
              <input
                type="range"
                min={2000}
                max={2023}
                value={endYear}
                onChange={(e) => setEndYear(parseInt(e.target.value, 10))}
                className="w-full accent-[#00D4FF] h-2 bg-[#0D1B2A] rounded-lg cursor-pointer"
              />
            </div>

            {/* Resolution Buttons */}
            <div className="space-y-1">
              <span className="text-xs text-slate-300 font-medium block">Resolution:</span>
              <div className="flex bg-[#0D1B2A] p-1 rounded-xl border border-[#1E3A56]">
                <button
                  type="button"
                  onClick={() => setFrequency('monthly')}
                  className={`flex-1 py-1.5 text-xs rounded-lg font-semibold transition ${
                    frequency === 'monthly'
                      ? 'bg-[#00D4FF] text-[#071426] font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('daily')}
                  className={`flex-1 py-1.5 text-xs rounded-lg font-semibold transition ${
                    frequency === 'daily'
                      ? 'bg-[#00D4FF] text-[#071426] font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Daily
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => runAnalysis()}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#00D4FF] to-[#0099FF] text-[#071426] font-extrabold text-sm sm:text-base hover:brightness-110 transition shadow-xl shadow-[#00D4FF]/25 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Computing Non-Parametric Statistics...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  <span>Analyze Environmental Trends</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Friendly Error Callout with Safe Fallbacks */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-200">Analysis Encountered an Issue</h3>
              <p className="text-xs text-red-300/90 leading-relaxed">{error}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2 pl-0 sm:pl-11">
            <button
              type="button"
              onClick={() => runAnalysis()}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-red-500/20 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Analysis</span>
            </button>
            <Link
              to="/cases"
              className="px-4 py-2 rounded-xl bg-[#0D1B2A] hover:bg-[#13263A] border border-[#1E3A56] text-[#00D4FF] text-xs font-bold transition flex items-center space-x-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Verified Detective Cases</span>
            </Link>
          </div>
        </div>
      )}

      {/* RESULTS PRESENTATION ORDER */}
      {summary && (
        <div className="space-y-6 animate-fade-in">

          {/* Open Ocean Coordinates Advisory */}
          {summary.is_ocean && (
            <div className="bg-blue-500/15 border border-blue-500/40 p-4 rounded-2xl flex items-start space-x-3 text-blue-200 text-xs sm:text-sm">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <b className="font-bold">Open Ocean Coordinates ({latitude.toFixed(2)}°, {longitude.toFixed(2)}°):</b>
                <p className="text-xs text-blue-300/90 mt-1">
                  Direct ground weather stations are not installed at open sea coordinates. Observations reflect NASA MERRA-2 global atmospheric reanalysis and spaceborne radiometry data.
                </p>
              </div>
            </div>
          )}

          {/* 1. Persistent AMBER Banner if Demonstration Data */}
          {summary.is_demonstration && (
            <div className="bg-amber-500/15 border border-amber-500/50 p-3.5 rounded-2xl flex items-center space-x-3 text-amber-300 text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <b className="font-bold">SAMPLE DATA — NOT NASA OBSERVATIONS:</b>
                <span className="ml-1">
                  The live NASA POWER gateway was temporarily unreachable. Displaying calibrated demonstration values.
                </span>
              </div>
            </div>
          )}

          {/* 2. One-Sentence Plain English HEADLINE */}
          <div className="bg-gradient-to-r from-[#0D1B2A] via-[#13263A] to-[#0D1B2A] border border-[#1E3A56] p-5 rounded-2xl shadow-xl flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              summary.is_significant && summary.sens_slope_per_year > 0
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : summary.is_significant && summary.sens_slope_per_year < 0
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
            }`}>
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Scientific Assessment Headline</div>
              <h2 className="text-base sm:text-lg font-bold text-white font-heading leading-snug">
                {summary.headline || `${activeVarMeta.name} exhibits ${summary.trend_direction} trend in ${locationName}.`}
              </h2>
            </div>
          </div>

          {/* 3. Hero Chart: Observations + Trend Line + 95% CI Band */}
          <TimeSeriesChart
            data={timeSeriesData}
            variableName={summary.variable_name}
            unit={summary.unit}
            pettitt={summary.pettitt}
            headline={summary.headline}
            onDownloadCsv={() => {
              window.location.href = getCsvExportUrl({
                latitude,
                longitude,
                location_name: locationName,
                variable: selectedVariable,
                start_date: `${startYear}-01-01`,
                end_date: `${endYear}-12-31`,
                frequency
              });
            }}
          />

          {/* 4. Four Core Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Rate Per Decade */}
            <div className="bg-[#13263A] border border-[#1E3A56] p-4 rounded-2xl shadow-lg space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Sen's Rate of Change</div>
              <div className="text-2xl font-extrabold text-[#00D4FF] font-mono">
                {summary.rate_per_decade > 0 ? '+' : ''}{summary.rate_per_decade}
                <span className="text-xs text-slate-400 font-normal ml-1">{summary.unit}/dec</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                ({summary.sens_slope_per_year > 0 ? '+' : ''}{summary.sens_slope_per_year.toFixed(4)} {summary.unit}/yr)
              </div>
            </div>

            {/* Card 2: P-Value & Significance (Color-blind safe) */}
            <div className="bg-[#13263A] border border-[#1E3A56] p-4 rounded-2xl shadow-lg space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Statistical Significance</div>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                    summary.is_significant && summary.sens_slope_per_year > 0
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                      : summary.is_significant && summary.sens_slope_per_year < 0
                      ? 'bg-red-500/15 text-red-400 border-red-500/40'
                      : 'bg-slate-500/15 text-slate-400 border-slate-500/40'
                  }`}
                >
                  {summary.is_significant ? <CheckCircle2 className="w-3.5 h-3.5" /> : <HelpCircle className="w-3.5 h-3.5" />}
                  <span>{summary.is_significant ? (summary.sens_slope_per_year > 0 ? 'Sig. Increase' : 'Sig. Decrease') : 'No Significant Trend'}</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono pt-0.5">
                p-value: <b className="text-white font-mono">{summary.mann_kendall?.p_value?.toFixed(5) || 'N/A'}</b> (α = 0.05)
              </div>
            </div>

            {/* Card 3: Total Estimated Change */}
            <div className="bg-[#13263A] border border-[#1E3A56] p-4 rounded-2xl shadow-lg space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Estimated Total Shift</div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {summary.total_change > 0 ? '+' : ''}{summary.total_change}
                <span className="text-xs text-slate-400 font-normal ml-1">{summary.unit}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Across {endYear - startYear + 1} years ({startYear}–{endYear})
              </div>
            </div>

            {/* Card 4: Data Quality & Grid */}
            <div className="bg-[#13263A] border border-[#1E3A56] p-4 rounded-2xl shadow-lg space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Data Quality & Sensor Grid</div>
              <div className="text-2xl font-extrabold text-[#35D07F] font-mono">
                {summary.observation_count}
                <span className="text-xs text-slate-400 font-normal ml-1">obs ({100 - summary.missing_percentage}%)</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                ~50 km cell &bull; {summary.source}
              </div>
            </div>
          </div>

          {/* 5. Collapsed Advanced Statistics Accordion */}
          <div className="bg-[#13263A] border border-[#1E3A56] rounded-2xl overflow-hidden shadow-xl">
            <button
              type="button"
              onClick={() => setShowAdvancedStats(!showAdvancedStats)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#1E3A56]/30 transition"
            >
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-[#00D4FF]" />
                <span className="text-sm font-bold text-white font-heading">Advanced Statistical Indicators</span>
                <span className="text-xs text-slate-400 font-mono">(Autocorrelation, Pettitt Test, Seasonal MK)</span>
              </div>
              {showAdvancedStats ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showAdvancedStats && (
              <div className="p-5 border-t border-[#1E3A56] space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* OLS Linear Regression */}
                  <div className="bg-[#0D1B2A] p-3.5 rounded-xl border border-[#1E3A56] space-y-1 font-mono">
                    <div className="text-slate-400 font-sans font-bold">OLS Regression Parameters</div>
                    <div>Slope: <b className="text-white">{summary.linear_regression?.slope_per_year?.toFixed(4)} {summary.unit}/yr</b></div>
                    <div>Intercept: <b className="text-white">{summary.linear_regression?.intercept?.toFixed(2)}</b></div>
                    <div>R² Score: <b className="text-[#00D4FF]">{summary.linear_regression?.r_squared?.toFixed(4)}</b></div>
                    <div>p-value: <b className="text-white">{summary.linear_regression?.p_value?.toFixed(5)}</b></div>
                  </div>

                  {/* Mann-Kendall Test Statistics */}
                  <div className="bg-[#0D1B2A] p-3.5 rounded-xl border border-[#1E3A56] space-y-1 font-mono">
                    <div className="text-slate-400 font-sans font-bold">Mann-Kendall Details</div>
                    <div>Tau (τ): <b className="text-white">{summary.mann_kendall?.tau?.toFixed(4)}</b></div>
                    <div>S-Statistic: <b className="text-white">{summary.mann_kendall?.s}</b></div>
                    <div>Variance Var(S): <b className="text-white">{summary.mann_kendall?.var_s}</b></div>
                    <div>Z-Score: <b className="text-[#00D4FF]">{summary.mann_kendall?.z?.toFixed(3)}</b></div>
                  </div>

                  {/* Serial Autocorrelation Check */}
                  <div className="bg-[#0D1B2A] p-3.5 rounded-xl border border-[#1E3A56] space-y-1 font-mono">
                    <div className="text-slate-400 font-sans font-bold">Lag-1 Serial Correlation</div>
                    <div>r₁ value: <b className={summary.autocorrelation?.is_significant ? 'text-amber-400' : 'text-white'}>
                      {summary.autocorrelation?.lag1?.toFixed(4)}
                    </b></div>
                    <div>Critical threshold: <b className="text-slate-400">±{summary.autocorrelation?.critical_value?.toFixed(3)}</b></div>
                    <div>Adjusted p-value: <b className="text-[#00D4FF]">{summary.autocorrelation?.adjusted_mk_p_value?.toFixed(5)}</b></div>
                    <div className="text-[10px] text-slate-400 font-sans pt-1">
                      {summary.autocorrelation?.explanation}
                    </div>
                  </div>

                  {/* Pettitt Change-Point Test */}
                  {summary.pettitt && (
                    <div className="bg-[#0D1B2A] p-3.5 rounded-xl border border-[#1E3A56] space-y-1 font-mono col-span-1 md:col-span-2 lg:col-span-3">
                      <div className="text-slate-400 font-sans font-bold flex items-center space-x-1.5">
                        <span>Pettitt Change-Point Detection (Pettitt, 1979)</span>
                        {summary.pettitt.is_significant && (
                          <span className="px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-400 text-[10px] border border-amber-500/30">
                            Statistically Significant
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <div>Change-Point Date: <b className="text-[#00D4FF]">{summary.pettitt.change_point_date || 'None'}</b></div>
                        <div>K-Statistic: <b className="text-white">{summary.pettitt.k_statistic}</b></div>
                        <div>Change-Point p-value: <b className="text-white">{summary.pettitt.p_value}</b></div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

          {/* Secondary Charts: Annual Mean vs Seasonal Profile */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSecondaryTab('yearly')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  secondaryTab === 'yearly'
                    ? 'bg-[#00D4FF] text-[#071426] border-[#00D4FF] font-bold'
                    : 'bg-[#0D1B2A] text-slate-300 border-[#1E3A56] hover:text-white'
                }`}
              >
                Annual Aggregates
              </button>
              <button
                type="button"
                onClick={() => setSecondaryTab('seasonal')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  secondaryTab === 'seasonal'
                    ? 'bg-[#00D4FF] text-[#071426] border-[#00D4FF] font-bold'
                    : 'bg-[#0D1B2A] text-slate-300 border-[#1E3A56] hover:text-white'
                }`}
              >
                Monthly Seasonal Profile
              </button>
            </div>

            {secondaryTab === 'yearly' ? (
              <YearlyChart data={yearlyData} unit={summary.unit} />
            ) : (
              <SeasonalChart data={monthlyData} unit={summary.unit} />
            )}
          </div>

          {/* 6. "Explain This" AI Assistant Section */}
          <AskEarthPulseSection currentAnalysis={summary} />

        </div>
      )}

    </div>
  );
}
