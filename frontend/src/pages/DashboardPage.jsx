import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  GitCompare,
  BookOpen,
  History,
  FileText,
  Download,
  Play,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Info
} from 'lucide-react';
import {
  getVariables,
  analyzeTrend,
  getAnalysisHistory,
  getPdfReportUrl,
  getCsvExportUrl
} from '../services/api';
import InteractiveMap from '../components/InteractiveMap';
import VariableSelector from '../components/VariableSelector';
import DateSelector from '../components/DateSelector';
import MetricCard from '../components/MetricCard';
import TimeSeriesChart from '../components/TimeSeriesChart';
import YearlyChart from '../components/YearlyChart';
import SeasonalChart from '../components/SeasonalChart';
import AskEarthPulseSection from '../components/AskEarthPulseSection';

export default function DashboardPage() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('overview');

  // Input States (Default: Bengaluru, Karnataka)
  const [locationName, setLocationName] = useState('Bengaluru, Karnataka');
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [selectedVariable, setSelectedVariable] = useState('T2M');
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [frequency, setFrequency] = useState('monthly');

  // Data & Analysis State
  const [variables, setVariables] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyRuns, setHistoryRuns] = useState([]);

  // Load Initial Variables & Run Default Analysis
  useEffect(() => {
    getVariables()
      .then(vars => {
        setVariables(vars);
      })
      .catch(err => console.error("Failed to load variables:", err));

    // Trigger initial default analysis for Bengaluru
    triggerAnalysis();
    loadHistory();
  }, []);

  const loadHistory = () => {
    getAnalysisHistory(10)
      .then(data => setHistoryRuns(data || []))
      .catch(() => {});
  };

  const triggerAnalysis = async (customParams = null) => {
    setLoading(true);
    setError(null);

    const payload = customParams || {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      location_name: locationName,
      variable: selectedVariable,
      start_date: startDate,
      end_date: endDate,
      frequency: frequency
    };

    try {
      const data = await analyzeTrend(payload);
      setAnalysisResult(data);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to analyze trend.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (name, lat, lon) => {
    setLocationName(name);
    setLatitude(lat);
    setLongitude(lon);
  };

  const currentVarInfo = variables.find(v => v.parameter === selectedVariable) || {
    name: selectedVariable,
    unit: '°C',
    source: 'NASA POWER'
  };

  const reportQueryParams = {
    latitude,
    longitude,
    location_name: locationName,
    variable: selectedVariable,
    start_date: startDate,
    end_date: endDate,
    frequency
  };

  return (
    <div className="min-h-screen bg-[#071426] text-white flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-[#0D1B2A] border-r border-[#1E3A56] p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          {/* Sidebar Section Title */}
          <div className="px-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00D4FF] block">
              Environmental Workspace
            </span>
            <h2 className="text-sm font-bold text-white">Analytics Navigator</h2>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs">
            {[
              { id: 'overview', label: 'Overview & Trends', icon: BarChart2 },
              { id: 'location', label: 'Location Explorer', icon: MapPin },
              { id: 'variables', label: 'Explore Variables', icon: Layers },
              { id: 'ai', label: 'Ask EarthPulse AI', icon: Sparkles },
              { id: 'history', label: 'Analysis History', icon: History },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition text-left ${
                    isActive
                      ? 'bg-[#13263A] text-[#00D4FF] border border-[#00D4FF]/30 font-semibold shadow-sm'
                      : 'text-[#9BAEC2] hover:text-white hover:bg-[#13263A]/50'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Current Query Quick Summary Box */}
          <div className="bg-[#13263A] border border-[#1E3A56] rounded-xl p-3 text-[11px] space-y-2">
            <div className="text-[#00D4FF] font-semibold flex items-center justify-between">
              <span>Active Target</span>
              <span className="w-2 h-2 rounded-full bg-[#35D07F]"></span>
            </div>
            <div>
              <div className="text-white font-bold truncate">{locationName}</div>
              <div className="text-[#9BAEC2] font-mono text-[10px]">
                {latitude.toFixed(2)}°N, {longitude.toFixed(2)}°E
              </div>
            </div>
            <div className="pt-1 border-t border-[#1E3A56] flex items-center justify-between text-[#9BAEC2]">
              <span>Variable:</span>
              <span className="text-white font-mono font-bold">{selectedVariable}</span>
            </div>
            <div className="flex items-center justify-between text-[#9BAEC2]">
              <span>Window:</span>
              <span className="text-white">{startDate.slice(0, 4)}–{endDate.slice(0, 4)}</span>
            </div>
          </div>

        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-[#1E3A56] text-[10px] text-[#9BAEC2] space-y-1">
          <div className="flex items-center gap-1 text-[#35D07F]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NASA POWER Verified</span>
          </div>
          <p>© 2026 EarthPulse AI Engine</p>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* STICKY TOP CONTROL STRIP */}
        <div className="bg-[#13263A] border border-[#1E3A56] rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Quick Variable Dropdown */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div>
                <label className="block text-[10px] text-[#9BAEC2] uppercase font-semibold mb-1">
                  Environmental Variable
                </label>
                <select
                  value={selectedVariable}
                  onChange={(e) => setSelectedVariable(e.target.value)}
                  className="bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00D4FF] font-medium"
                >
                  {variables.map(v => (
                    <option key={v.parameter} value={v.parameter}>
                      {v.parameter} — {v.name} ({v.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Location Badge */}
              <div>
                <label className="block text-[10px] text-[#9BAEC2] uppercase font-semibold mb-1">
                  Target Location
                </label>
                <button
                  onClick={() => setActiveTab('location')}
                  className="bg-[#0D1B2A] border border-[#1E3A56] hover:border-[#00D4FF] rounded-lg px-3 py-1.5 text-xs text-white flex items-center gap-1.5 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#00D4FF]" />
                  <span className="font-semibold truncate max-w-[160px] sm:max-w-[220px]">{locationName}</span>
                </button>
              </div>
            </div>

            {/* Run Analysis & Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
              
              <button
                onClick={() => triggerAnalysis()}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#35D07F] text-[#071426] font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition shadow-[0_0_15px_rgba(0,212,255,0.3)] active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Data...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Statistical Analysis</span>
                  </>
                )}
              </button>

              <a
                href={getPdfReportUrl(reportQueryParams)}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#0D1B2A] hover:bg-[#1E3A56] border border-[#1E3A56] text-xs text-white font-medium flex items-center gap-1.5 transition active:scale-95"
              >
                <FileText className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span className="hidden sm:inline">Download</span> PDF
              </a>

              <a
                href={getCsvExportUrl(reportQueryParams)}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#0D1B2A] hover:bg-[#1E3A56] border border-[#1E3A56] text-xs text-white font-medium flex items-center gap-1.5 transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-[#35D07F]" />
                <span className="hidden sm:inline">Export</span> CSV
              </a>

            </div>

          </div>
        </div>

        {/* ERROR NOTICE BANNER */}
        {error && (
          <div className="bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 p-4 rounded-xl flex items-center gap-3 text-xs text-[#FF4D4D]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="space-y-1">
              <span className="font-bold">Analysis Execution Notice:</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW & TREND ANALYSIS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Primary Statistical Cards */}
            {analysisResult && (
              <MetricCard summary={analysisResult.summary} />
            )}

            {/* Historical Recharts Visualizations */}
            {analysisResult && (
              <TimeSeriesChart
                data={analysisResult.data.time_series}
                variableName={analysisResult.summary.variable_name}
                unit={analysisResult.summary.unit}
                onDownloadCsv={() => window.open(getCsvExportUrl(reportQueryParams), '_blank')}
              />
            )}

            {/* Annual Aggregates & Seasonal Climatology */}
            {analysisResult && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <YearlyChart
                  data={analysisResult.data.yearly_averages}
                  unit={analysisResult.summary.unit}
                />
                <SeasonalChart
                  data={analysisResult.data.monthly_variation}
                  unit={analysisResult.summary.unit}
                />
              </div>
            )}

            {/* Scientific Explanation & Earth Systems Context */}
            {analysisResult && (
              <div className="bg-[#13263A] rounded-xl border border-[#1E3A56] p-5 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base border-b border-[#1E3A56] pb-2">
                  <BookOpen className="w-4 h-4 text-[#00D4FF]" />
                  <span>Earth Science Interpretation & Evidence</span>
                </div>
                <div className="text-xs text-[#9BAEC2] leading-relaxed whitespace-pre-line space-y-2">
                  {analysisResult.summary.scientific_explanation}
                </div>
                <div className="pt-2 border-t border-[#1E3A56] text-[11px] text-[#9BAEC2] italic">
                  {analysisResult.summary.methodology_limitations}
                </div>
              </div>
            )}

            {/* Grounded AI Data Detective Section */}
            <AskEarthPulseSection currentAnalysis={analysisResult?.summary} />

          </div>
        )}

        {/* TAB 2: LOCATION EXPLORER */}
        {activeTab === 'location' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#00D4FF]" />
                  <span>Interactive Global Location Explorer</span>
                </h3>
                <p className="text-xs text-[#9BAEC2]">
                  Search for cities, click anywhere on the planet to set target coordinates, or enter latitude and longitude manually.
                </p>
              </div>
            </div>

            <InteractiveMap
              locationName={locationName}
              latitude={latitude}
              longitude={longitude}
              onLocationChange={handleLocationChange}
            />

            <DateSelector
              startDate={startDate}
              endDate={endDate}
              frequency={frequency}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onFrequencyChange={setFrequency}
            />

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  triggerAnalysis();
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#35D07F] text-[#071426] font-bold text-xs flex items-center gap-2 hover:brightness-110 transition shadow-lg"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Apply Location & Run Analysis</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: EXPLORE VARIABLES */}
        {activeTab === 'variables' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#00D4FF]" />
                  <span>NASA Earth Science Variable Library</span>
                </h3>
                <p className="text-xs text-[#9BAEC2]">
                  Select environmental variables to explore physical definitions, measurement units, and scientific context.
                </p>
              </div>
            </div>

            <VariableSelector
              variables={variables}
              selectedVariable={selectedVariable}
              onSelectVariable={(p) => {
                setSelectedVariable(p);
                setActiveTab('overview');
                triggerAnalysis({
                  latitude: parseFloat(latitude),
                  longitude: parseFloat(longitude),
                  location_name: locationName,
                  variable: p,
                  start_date: startDate,
                  end_date: endDate,
                  frequency: frequency
                });
              }}
            />
          </div>
        )}

        {/* TAB 4: ASK EARTHPULSE AI */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <AskEarthPulseSection currentAnalysis={analysisResult?.summary} />
          </div>
        )}

        {/* TAB 5: ANALYSIS HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-[#13263A] rounded-xl border border-[#1E3A56] p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E3A56] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-[#00D4FF]" />
                  <span>SQLite Analysis Run Archive</span>
                </h3>
                <p className="text-xs text-[#9BAEC2]">
                  Previous trend assessments stored in local SQLite database.
                </p>
              </div>
              <button
                onClick={loadHistory}
                className="px-3 py-1 rounded-lg bg-[#0D1B2A] border border-[#1E3A56] text-xs text-[#00D4FF] hover:bg-[#1E3A56] transition"
              >
                Refresh Archive
              </button>
            </div>

            {historyRuns.length === 0 ? (
              <p className="text-xs text-[#9BAEC2] py-8 text-center">No previous runs recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0D1B2A] text-[#9BAEC2] uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-2.5">Date & Time</th>
                      <th className="p-2.5">Region</th>
                      <th className="p-2.5">Variable</th>
                      <th className="p-2.5">Window</th>
                      <th className="p-2.5">Sen's Slope</th>
                      <th className="p-2.5">MK P-Value</th>
                      <th className="p-2.5">Significance</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E3A56] text-white">
                    {historyRuns.map(run => (
                      <tr key={run.id} className="hover:bg-[#0D1B2A]/50 transition">
                        <td className="p-2.5 font-mono text-[#9BAEC2]">{run.created_at?.slice(0, 16).replace('T', ' ')}</td>
                        <td className="p-2.5 font-semibold">{run.location_name}</td>
                        <td className="p-2.5 font-mono text-[#00D4FF]">{run.variable}</td>
                        <td className="p-2.5 text-[#9BAEC2]">{run.start_date?.slice(0, 4)}–{run.end_date?.slice(0, 4)}</td>
                        <td className="p-2.5 font-mono font-bold">{run.sen_slope > 0 ? `+${run.sen_slope}` : run.sen_slope}</td>
                        <td className="p-2.5 font-mono">{run.p_value}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            run.is_significant ? 'bg-[#35D07F]/20 text-[#35D07F]' : 'bg-[#9BAEC2]/20 text-[#9BAEC2]'
                          }`}>
                            {run.is_significant ? 'Significant' : 'No Trend'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => {
                              setLocationName(run.location_name);
                              setLatitude(run.latitude);
                              setLongitude(run.longitude);
                              setSelectedVariable(run.variable);
                              setStartDate(run.start_date);
                              setEndDate(run.end_date);
                              setFrequency(run.temporal_resolution);
                              setActiveTab('overview');
                              triggerAnalysis({
                                latitude: run.latitude,
                                longitude: run.longitude,
                                location_name: run.location_name,
                                variable: run.variable,
                                start_date: run.start_date,
                                end_date: run.end_date,
                                frequency: run.temporal_resolution
                              });
                            }}
                            className="px-2.5 py-1 bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF] hover:text-[#071426] rounded transition font-semibold"
                          >
                            Re-Run
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
}
