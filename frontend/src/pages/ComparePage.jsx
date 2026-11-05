import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Activity,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { getVariables, compareRegions } from '../services/api';

const PRESET_COMPARISONS = [
  {
    label: 'Bengaluru vs Chennai (Deccan Plateau vs Coromandel Coast)',
    locA: { name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946 },
    locB: { name: 'Chennai, Tamil Nadu', lat: 13.0827, lon: 80.2707 },
    variable: 'T2M'
  },
  {
    label: 'Mumbai vs New Delhi (Coastal Maritime vs Northern Continental)',
    locA: { name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777 },
    locB: { name: 'New Delhi, NCR', lat: 28.6139, lon: 77.2090 },
    variable: 'T2M'
  },
  {
    label: 'Bengaluru vs Mumbai (Precipitation Comparison)',
    locA: { name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946 },
    locB: { name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777 },
    variable: 'PRECTOTCORR'
  }
];

const CustomCompareTooltip = ({ active, payload, label, unit, nameA, nameB }) => {
  if (active && payload && payload.length) {
    const valA = payload.find(p => p.dataKey === nameA)?.value;
    const valB = payload.find(p => p.dataKey === nameB)?.value;

    return (
      <div className="bg-[#071426]/95 backdrop-blur-md border border-[#1E3A56] p-3 rounded-xl shadow-2xl text-xs space-y-1 z-50">
        <div className="font-bold text-white border-b border-[#1E3A56] pb-1 font-mono">{label}</div>
        <div className="flex items-center justify-between gap-4 text-[#00D4FF]">
          <span className="truncate max-w-[150px]">{nameA}:</span>
          <span className="font-mono font-bold">{valA !== undefined ? `${valA} ${unit}` : 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-[#35D07F]">
          <span className="truncate max-w-[150px]">{nameB}:</span>
          <span className="font-mono font-bold">{valB !== undefined ? `${valB} ${unit}` : 'N/A'}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function ComparePage() {
  const [variables, setVariables] = useState([]);
  const [selectedVar, setSelectedVar] = useState('T2M');
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [frequency, setFrequency] = useState('monthly');

  // Location A: Bengaluru (Default)
  const [nameA, setNameA] = useState('Bengaluru, Karnataka');
  const [latA, setLatA] = useState(12.9716);
  const [lonA, setLonA] = useState(77.5946);

  // Location B: Chennai (Default)
  const [nameB, setNameB] = useState('Chennai, Tamil Nadu');
  const [latB, setLatB] = useState(13.0827);
  const [lonB, setLonB] = useState(80.2707);

  const [compareResult, setCompareResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getVariables()
      .then(res => setVariables(res))
      .catch(() => {});
    handleRunComparison();
  }, []);

  const handleRunComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await compareRegions({
        location_a: { name: nameA, latitude: parseFloat(latA), longitude: parseFloat(lonA) },
        location_b: { name: nameB, latitude: parseFloat(latB), longitude: parseFloat(lonB) },
        variable: selectedVar,
        start_date: startDate,
        end_date: endDate,
        frequency: frequency
      });
      setCompareResult(res);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setNameA(preset.locA.name);
    setLatA(preset.locA.lat);
    setLonA(preset.locA.lon);
    setNameB(preset.locB.name);
    setLatB(preset.locB.lat);
    setLonB(preset.locB.lon);
    setSelectedVar(preset.variable);
  };

  return (
    <div className="min-h-screen bg-[#071426] text-white p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="space-y-1 border-b border-[#1E3A56] pb-4">
        <div className="flex items-center gap-2 text-xs text-[#00D4FF] font-semibold uppercase tracking-wider">
          <GitCompare className="w-4 h-4" />
          <span>Regional Environmental Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Regional Environmental Trend Comparison
        </h1>
        <p className="text-xs sm:text-sm text-[#9BAEC2] max-w-2xl">
          Evaluate how environmental rates of change, climate sensitivity, and statistical significance differ between two distinct geographic locations.
        </p>
      </div>

      {/* Preset Comparison Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#9BAEC2] font-medium mr-1">Benchmark Presets:</span>
        {PRESET_COMPARISONS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              applyPreset(p);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#13263A] border border-[#1E3A56] text-[#9BAEC2] hover:text-[#00D4FF] hover:border-[#00D4FF] transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Configuration Controls Card */}
      <div className="bg-[#13263A] rounded-2xl border border-[#1E3A56] p-4 sm:p-5 shadow-xl space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Location A Box */}
          <div className="bg-[#0D1B2A] p-4 rounded-xl border border-[#00D4FF]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00D4FF] flex items-center gap-1.5 uppercase tracking-wide">
                <MapPin className="w-4 h-4" />
                <span>Location A</span>
              </span>
              <span className="text-[10px] text-[#9BAEC2]">Reference Region</span>
            </div>
            <div>
              <label className="block text-[11px] text-[#9BAEC2] mb-1">Location Name</label>
              <input
                type="text"
                value={nameA}
                onChange={(e) => setNameA(e.target.value)}
                className="w-full bg-[#13263A] border border-[#1E3A56] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] text-[#9BAEC2] mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latA}
                  onChange={(e) => setLatA(e.target.value)}
                  className="w-full bg-[#13263A] border border-[#1E3A56] rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#9BAEC2] mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lonA}
                  onChange={(e) => setLonA(e.target.value)}
                  className="w-full bg-[#13263A] border border-[#1E3A56] rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
            </div>
          </div>

          {/* Location B Box */}
          <div className="bg-[#0D1B2A] p-4 rounded-xl border border-[#35D07F]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#35D07F] flex items-center gap-1.5 uppercase tracking-wide">
                <MapPin className="w-4 h-4" />
                <span>Location B</span>
              </span>
              <span className="text-[10px] text-[#9BAEC2]">Comparison Region</span>
            </div>
            <div>
              <label className="block text-[11px] text-[#9BAEC2] mb-1">Location Name</label>
              <input
                type="text"
                value={nameB}
                onChange={(e) => setNameB(e.target.value)}
                className="w-full bg-[#13263A] border border-[#1E3A56] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#35D07F]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] text-[#9BAEC2] mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latB}
                  onChange={(e) => setLatB(e.target.value)}
                  className="w-full bg-[#13263A] border border-[#1E3A56] rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#35D07F]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#9BAEC2] mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lonB}
                  onChange={(e) => setLonB(e.target.value)}
                  className="w-full bg-[#13263A] border border-[#1E3A56] rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#35D07F]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Variable & Date Window Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1E3A56]">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] text-[#9BAEC2] uppercase font-semibold mb-1">
                Variable
              </label>
              <select
                value={selectedVar}
                onChange={(e) => setSelectedVar(e.target.value)}
                className="bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
              >
                {variables.map(v => (
                  <option key={v.parameter} value={v.parameter}>
                    {v.parameter} — {v.name} ({v.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div>
                <label className="block text-[10px] text-[#9BAEC2] uppercase font-semibold mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#9BAEC2] uppercase font-semibold mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleRunComparison}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#35D07F] text-[#071426] font-bold text-xs flex items-center gap-2 hover:brightness-110 transition shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Comparative Models...</span>
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4" />
                <span>Execute Regional Comparison</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* ERROR NOTICE */}
      {error && (
        <div className="bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 p-4 rounded-xl flex items-center gap-3 text-xs text-[#FF4D4D]">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* COMPARISON RESULTS */}
      {compareResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Side-by-Side Slopes and Significance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card A */}
            <div className="bg-[#13263A] rounded-2xl border border-[#00D4FF]/40 p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E3A56]">
                <h3 className="font-bold text-white text-base text-[#00D4FF] flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{compareResult.location_a.location_name}</span>
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  compareResult.location_a.is_significant
                    ? 'bg-[#35D07F]/20 text-[#35D07F]'
                    : 'bg-[#9BAEC2]/20 text-[#9BAEC2]'
                }`}>
                  {compareResult.location_a.is_significant ? 'Statistically Significant' : 'No Trend'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#9BAEC2] block text-[10px]">Sen's Slope:</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {compareResult.location_a.sens_slope_per_year > 0 ? `+${compareResult.location_a.sens_slope_per_year}` : compareResult.location_a.sens_slope_per_year}{' '}
                    <span className="text-xs font-normal text-[#9BAEC2]">{compareResult.unit}/yr</span>
                  </span>
                </div>
                <div>
                  <span className="text-[#9BAEC2] block text-[10px]">MK P-Value:</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {compareResult.location_a.mann_kendall.p_value}
                  </span>
                </div>
                <div>
                  <span className="text-[#9BAEC2] block text-[10px]">OLS Slope (R²):</span>
                  <span className="font-mono text-white">
                    {compareResult.location_a.linear_regression.slope_per_year} (R²={compareResult.location_a.linear_regression.r_squared})
                  </span>
                </div>
                <div>
                  <span className="text-[#9BAEC2] block text-[10px]">Valid Data Points:</span>
                  <span className="font-mono text-white">
                    {compareResult.location_a.valid_count} obs
                  </span>
                </div>
              </div>
            </div>

            {/* Card B */}
            <div className="bg-[#13263A] rounded-2xl border border-[#35D07F]/40 p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E3A56]">
                <h3 className="font-bold text-white text-base text-[#35D07F] flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{compareResult.location_b.location_name}</span>
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  compareResult.location_b.is_significant
                    ? 'bg-[#35D07F]/20 text-[#35D07F]'
                    : 'bg-[#9BAEC2]/20 text-[#9BAEC2]'
                }`}>
                  {compareResult.location_b.is_significant ? 'Statistically Significant' : 'No Trend'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#9BAEC2] block text-[10px]">Sen's Slope:</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {compareResult.location_b.sens_slope_per_year > 0 ? `+${compareResult.location_b.sens_slope_per_year}` : compareResult.location_b.sens_slope_per_year}{' '}
                    <span className="text-xs font-normal text-[#9BAEC2]">{compareResult.unit}/yr</span>
                  </span>
                </div>
                <div>
                  <span className="text-[#9BAEC2] block text-[10px]">MK P-Value:</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {compareResult.location_b.mann_kendall.p_value}
                  </span>
                </div>
                <div>
                  <span className="text-[#9BAEC2] block text-[10px]">OLS Slope (R²):</span>
                  <span className="font-mono text-white">
                    {compareResult.location_b.linear_regression.slope_per_year} (R²={compareResult.location_b.linear_regression.r_squared})
                  </span>
                </div>
                <div>
                  <span className="text-[#9BAEC2] block text-[10px]">Valid Data Points:</span>
                  <span className="font-mono text-white">
                    {compareResult.location_b.valid_count} obs
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Combined Dual-Series Chart */}
          <div className="bg-[#13263A] rounded-2xl border border-[#1E3A56] p-5 shadow-xl space-y-3">
            <div className="pb-2 border-b border-[#1E3A56]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00D4FF]" />
                <span>Simultaneous Time-Series Comparison: {nameA} vs {nameB}</span>
              </h3>
              <p className="text-xs text-[#9BAEC2]">
                Superimposed historical observations plotted on a shared time axis.
              </p>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={compareResult.comparison_time_series} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3A56" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#9BAEC2"
                    fontSize={11}
                    tickFormatter={(val) => val?.slice(0, 7)}
                    minTickGap={45}
                  />
                  <YAxis
                    stroke="#9BAEC2"
                    fontSize={11}
                    domain={['auto', 'auto']}
                    unit={` ${compareResult.unit}`}
                  />
                  <Tooltip content={<CustomCompareTooltip unit={compareResult.unit} nameA={nameA} nameB={nameB} />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey={nameA}
                    stroke="#00D4FF"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={nameB}
                    stroke="#35D07F"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparative Scientific Narrative */}
          <div className="bg-[#0D1B2A] rounded-2xl border border-[#1E3A56] p-5 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00D4FF]" />
              <span>Comparative Scientific Assessment</span>
            </h4>
            <div className="text-xs text-[#9BAEC2] leading-relaxed whitespace-pre-line space-y-2">
              {compareResult.narrative}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
