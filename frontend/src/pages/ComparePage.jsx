import React, { useState, useEffect, memo } from 'react';
import {
  GitCompare,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Zap
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
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getVariables, compareRegions } from '../services/api';

const pinIconA = L.divIcon({
  className: 'compare-pin-a',
  html: `
    <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; transform: translateY(-8px);">
      <div style="width: 22px; height: 22px; border-radius: 50%; background: rgba(0, 212, 255, 0.4); border: 2px solid #00D4FF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px #00D4FF;">
        <span style="color: #071426; font-size: 11px; font-weight: bold;">A</span>
      </div>
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 22]
});

const pinIconB = L.divIcon({
  className: 'compare-pin-b',
  html: `
    <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; transform: translateY(-8px);">
      <div style="width: 22px; height: 22px; border-radius: 50%; background: rgba(245, 158, 11, 0.4); border: 2px solid #F59E0B; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px #F59E0B;">
        <span style="color: #071426; font-size: 11px; font-weight: bold;">B</span>
      </div>
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 22]
});

const PRESET_COMPARISONS = [
  {
    label: 'Bengaluru vs Chennai (Plateau vs Coast)',
    locA: { name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946 },
    locB: { name: 'Chennai, Tamil Nadu', lat: 13.0827, lon: 80.2707 },
    variable: 'T2M'
  },
  {
    label: 'Amazon vs Sahel (Deforestation vs Desertification)',
    locA: { name: 'Amazon Basin', lat: -3.4653, lon: -62.2159 },
    locB: { name: 'Sahel Region', lat: 14.4974, lon: 14.4524 },
    variable: 'PRECTOTCORR'
  },
  {
    label: 'Greenland vs Bengaluru (Polar Amplification vs Urban)',
    locA: { name: 'Greenland Ice Sheet', lat: 72.0, lon: -40.0 },
    locB: { name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946 },
    variable: 'T2M'
  }
];

const CustomCompareTooltip = memo(({ active, payload, label, unit, nameA, nameB }) => {
  if (active && payload && payload.length) {
    const valA = payload.find(p => p.dataKey === nameA)?.value;
    const valB = payload.find(p => p.dataKey === nameB)?.value;

    return (
      <div className="bg-[#071426] border border-[#1E3A56] p-3 rounded-xl shadow-2xl text-xs space-y-1.5 z-50">
        <div className="font-bold text-white border-b border-[#1E3A56] pb-1 font-mono">{label}</div>
        <div className="flex items-center justify-between gap-4 text-[#00D4FF]">
          <span className="truncate max-w-[150px]">{nameA}:</span>
          <span className="font-mono font-bold">{valA !== undefined ? `${valA} ${unit}` : 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-amber-400">
          <span className="truncate max-w-[150px]">{nameB}:</span>
          <span className="font-mono font-bold">{valB !== undefined ? `${valB} ${unit}` : 'N/A'}</span>
        </div>
      </div>
    );
  }
  return null;
});

export default function ComparePage() {
  const [variables, setVariables] = useState([]);
  const [selectedVar, setSelectedVar] = useState('T2M');
  const [startYear, setStartYear] = useState(1990);
  const [endYear, setEndYear] = useState(2023);
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
      .then(res => setVariables(res || []))
      .catch(() => {});
    handleRunComparison();
  }, []);

  const handleRunComparison = async (overrideParams = null) => {
    setLoading(true);
    setError(null);

    const payload = overrideParams || {
      location_a: { name: nameA, latitude: parseFloat(latA), longitude: parseFloat(lonA) },
      location_b: { name: nameB, latitude: parseFloat(latB), longitude: parseFloat(lonB) },
      variable: selectedVar,
      start_date: `${startYear}-01-01`,
      end_date: `${endYear}-12-31`,
      frequency: frequency
    };

    try {
      const data = await compareRegions(payload);
      setCompareResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Comparison analysis failed.');
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

    handleRunComparison({
      location_a: preset.locA,
      location_b: preset.locB,
      variable: preset.variable,
      start_date: `${startYear}-01-01`,
      end_date: `${endYear}-12-31`,
      frequency: frequency
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 text-xs font-semibold">
          <GitCompare className="w-3.5 h-3.5" />
          <span>Regional Comparison Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
          Dual Region Trend Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Compare environmental rates of change between two global coordinates with dual pins and diverging trend detection.
        </p>
      </div>

      {/* Preset Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider shrink-0 text-[11px]">Compare Presets:</span>
        {PRESET_COMPARISONS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => applyPreset(preset)}
            className="shrink-0 px-3 py-1 rounded-full bg-[#13263A] border border-[#1E3A56] hover:border-[#00D4FF]/50 text-slate-300 hover:text-white transition text-xs"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Configuration Grid: Loc A + Loc B + Run Button */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Region A Card (Cyan) */}
        <div className="bg-[#13263A] border border-[#00D4FF]/40 p-4 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-[#00D4FF] font-bold text-sm">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00D4FF] text-[#071426] text-xs font-extrabold">A</span>
            <span>Region A (Cyan Line)</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Location Name</label>
              <input
                type="text"
                value={nameA}
                onChange={(e) => setNameA(e.target.value)}
                className="w-full bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#00D4FF]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.01"
                  value={latA}
                  onChange={(e) => setLatA(parseFloat(e.target.value))}
                  className="w-full bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-3 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.01"
                  value={lonA}
                  onChange={(e) => setLonA(parseFloat(e.target.value))}
                  className="w-full bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-3 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Region B Card (Amber) */}
        <div className="bg-[#13263A] border border-amber-500/40 p-4 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-[#071426] text-xs font-extrabold">B</span>
            <span>Region B (Amber Line)</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Location Name</label>
              <input
                type="text"
                value={nameB}
                onChange={(e) => setNameB(e.target.value)}
                className="w-full bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.01"
                  value={latB}
                  onChange={(e) => setLatB(parseFloat(e.target.value))}
                  className="w-full bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-3 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.01"
                  value={lonB}
                  onChange={(e) => setLonB(parseFloat(e.target.value))}
                  className="w-full bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-3 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variables & Period Row */}
      <div className="bg-[#0D1B2A] p-4 rounded-2xl border border-[#1E3A56] flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <span className="text-slate-400 font-semibold">Variable:</span>
          <select
            value={selectedVar}
            onChange={(e) => setSelectedVar(e.target.value)}
            className="bg-[#13263A] border border-[#1E3A56] rounded-lg px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-[#00D4FF]"
          >
            {variables.map((v) => (
              <option key={v.parameter} value={v.parameter}>
                {v.name} ({v.parameter})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3 text-slate-300">
          <span>Period: <b className="text-white font-mono">{startYear}–{endYear}</b></span>
          <button
            type="button"
            onClick={() => handleRunComparison()}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#071426] font-extrabold text-xs flex items-center space-x-2 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
            <span>Run Comparison</span>
          </button>
        </div>
      </div>

      {/* Two Pins Leaflet Map */}
      <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-[#1E3A56]">
        <MapContainer
          key={`compare-map-${latA}-${lonA}-${latB}-${lonB}`}
          center={[(latA + latB) / 2, (lonA + lonB) / 2]}
          zoom={3}
          minZoom={2}
          scrollWheelZoom={false}
          className="w-full h-full z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            maxZoom={19}
            subdomains="abcd"
          />
          <Marker position={[latA, lonA]} icon={pinIconA}>
            <Popup><b className="text-cyan-700">Region A: {nameA}</b></Popup>
          </Marker>
          <Marker position={[latB, lonB]} icon={pinIconB}>
            <Popup><b className="text-amber-700">Region B: {nameB}</b></Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Comparison Results */}
      {compareResult && (
        <div className="space-y-6">

          {/* Sample Data Warning if applicable */}
          {compareResult.is_demonstration && (
            <div className="bg-amber-500/15 border border-amber-500/50 p-3.5 rounded-2xl flex items-center space-x-3 text-amber-300 text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span><b>SAMPLE DATA WARNING:</b> Live NASA satellite observations unavailable for one or both locations; using demonstration data.</span>
            </div>
          )}

          {/* Diverging Trends Alert Banner */}
          {compareResult.diverging_trends && (
            <div className="bg-red-500/15 border border-red-500/50 p-4 rounded-2xl flex items-center space-x-3 text-red-300 text-sm animate-pulse">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <b className="font-bold">⚠️ DIVERGING TRENDS DETECTED:</b>
                <span className="ml-1">
                  The two regions exhibit trends in opposite directions! One region is experiencing an increase while the other is declining.
                </span>
              </div>
            </div>
          )}

          {/* Dual Line Chart */}
          <div className="bg-[#13263A] border border-[#1E3A56] p-4 sm:p-5 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E3A56]">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Comparative Time-Series: {nameA} vs {nameB}
                </h3>
                <p className="text-xs text-slate-400">
                  Cyan curve denotes {nameA}; Amber curve denotes {nameB}.
                </p>
              </div>
              <span className="text-xs font-mono text-[#00D4FF] font-semibold">{compareResult.unit}</span>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={compareResult.comparison_time_series} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3A56" vertical={false} />
                  <XAxis dataKey="date" stroke="#9BAEC2" fontSize={11} minTickGap={45} tickLine={{ stroke: '#1E3A56' }} />
                  <YAxis stroke="#9BAEC2" fontSize={11} domain={['auto', 'auto']} unit={` ${compareResult.unit}`} tickLine={{ stroke: '#1E3A56' }} />
                  <Tooltip content={<CustomCompareTooltip unit={compareResult.unit} nameA={nameA} nameB={nameB} />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                  <Line type="monotone" dataKey={nameA} stroke="#00D4FF" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey={nameB} stroke="#F59E0B" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stat Comparison Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0D1B2A] border border-[#00D4FF]/30 p-4 rounded-2xl space-y-2">
              <div className="text-xs font-bold text-[#00D4FF] uppercase tracking-wider">{nameA} Statistics</div>
              <div className="text-xl font-bold font-mono text-white">
                Sen's Slope: {compareResult.location_a?.sens_slope_per_year > 0 ? '+' : ''}{compareResult.location_a?.sens_slope_per_year?.toFixed(4)} {compareResult.unit}/yr
              </div>
              <div className="text-xs text-slate-400 font-mono">
                p-value: {compareResult.location_a?.mann_kendall?.p_value} ({compareResult.location_a?.is_significant ? 'Statistically Significant' : 'Not Significant'})
              </div>
            </div>

            <div className="bg-[#0D1B2A] border border-amber-500/30 p-4 rounded-2xl space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">{nameB} Statistics</div>
              <div className="text-xl font-bold font-mono text-white">
                Sen's Slope: {compareResult.location_b?.sens_slope_per_year > 0 ? '+' : ''}{compareResult.location_b?.sens_slope_per_year?.toFixed(4)} {compareResult.unit}/yr
              </div>
              <div className="text-xs text-slate-400 font-mono">
                p-value: {compareResult.location_b?.mann_kendall?.p_value} ({compareResult.location_b?.is_significant ? 'Statistically Significant' : 'Not Significant'})
              </div>
            </div>
          </div>

          {/* Narrative Analysis */}
          <div className="bg-[#0D1B2A] border border-[#1E3A56] p-4 rounded-2xl space-y-2 text-xs text-slate-200 whitespace-pre-line leading-relaxed">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Scientific Synthesis</div>
            {compareResult.narrative}
          </div>

        </div>
      )}
    </div>
  );
}
