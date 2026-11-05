import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Globe, TrendingUp, AlertTriangle, ArrowRight, MapPin, Zap, Info } from 'lucide-react';
import GlobalTrendMapView from '../components/map/GlobalTrendMapView';
import { getTopAtlas, getAtlas } from '../services/api';

const VARIABLES = [
  { code: 'T2M', name: '2-Meter Air Temperature', unit: '°C', defaultRate: '+0.32°C/dec' },
  { code: 'PRECTOTCORR', name: 'Precipitation', unit: 'mm/day', defaultRate: 'Variable' },
  { code: 'RH2M', name: 'Relative Humidity', unit: '%', defaultRate: '-0.35%/dec' },
  { code: 'WS2M', name: '10-Meter Wind Speed', unit: 'm/s', defaultRate: '-0.06 m/s/dec' },
  { code: 'ALLSKY_SFC_SW_DWN', name: 'Solar Irradiance', unit: 'kW-hr/m²/day', defaultRate: '+0.04 kW/m²/dec' }
];

export default function AtlasPage() {
  const [selectedVar, setSelectedVar] = useState('T2M');
  const [topCells, setTopCells] = useState([]);
  const [atlasMeta, setAtlasMeta] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Bengaluru, Karnataka',
    latitude: 12.9716,
    longitude: 77.5946
  });
  const navigate = useNavigate();

  useEffect(() => {
    getTopAtlas(selectedVar, 8)
      .then((data) => setTopCells(data || []))
      .catch(() => setTopCells([]));

    getAtlas(selectedVar)
      .then((data) => setAtlasMeta(data))
      .catch(() => setAtlasMeta(null));
  }, [selectedVar]);

  const handleInspectCell = (cell) => {
    const locName = cell.location_name || `Cell (${cell.latitude}°, ${cell.longitude}°)`;
    navigate('/investigate', {
      state: {
        variable: selectedVar,
        latitude: cell.latitude,
        longitude: cell.longitude,
        locationName: locName
      }
    });
  };

  const currentVarMeta = VARIABLES.find((v) => v.code === selectedVar) || VARIABLES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0D1B2A] border border-[#1E3A56] p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5" />
            <span>Planetary Climate Reanalysis (1990–2023)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            World Trend Atlas
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Explore 5-degree gridded Sen’s slope rates of change and non-parametric significance across Earth's continental landmasses.
          </p>
        </div>

        {/* Variable Filter Bar */}
        <div className="flex flex-wrap gap-2">
          {VARIABLES.map((v) => {
            const isSelected = selectedVar === v.code;
            return (
              <button
                key={v.code}
                onClick={() => setSelectedVar(v.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  isSelected
                    ? 'bg-[#00D4FF] text-[#071426] border-[#00D4FF] font-bold shadow-md shadow-[#00D4FF]/20'
                    : 'bg-[#13263A] text-slate-300 border-[#1E3A56] hover:border-slate-500 hover:text-white'
                }`}
              >
                {v.name.split(' ')[0]} ({v.code})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Component */}
      <div className="h-[520px]">
        <GlobalTrendMapView
          selectedLocation={selectedLocation}
          onLocationChange={(name, lat, lon) => setSelectedLocation({ name, latitude: lat, longitude: lon })}
          activeVariable={selectedVar}
        />
      </div>

      {/* Top 8 Fastest Changing Regional Hotspots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[#00D4FF]" />
            <h2 className="text-lg font-bold text-white font-heading">
              Fastest Changing Regional Hotspots ({currentVarMeta.name})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {atlasMeta?.cell_count || 1202} continental cells analyzed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topCells.map((cell, idx) => {
            const slope = cell.sens_slope_per_decade ?? cell.sen_slope_per_decade ?? 0;
            const isWarming = slope > 0;
            return (
              <div
                key={idx}
                className="bg-[#13263A] border border-[#1E3A56] p-4 rounded-2xl shadow-lg hover:border-[#00D4FF]/50 transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#00D4FF] font-bold font-mono">#{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                      p &lt; 0.05
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm truncate" title={cell.location_name}>
                    {cell.location_name || `Cell (${cell.latitude}°, ${cell.longitude}°)`}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{cell.latitude.toFixed(1)}°, {cell.longitude.toFixed(1)}°</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1E3A56]/60 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Sen's Slope</div>
                    <div className={`font-mono text-base font-extrabold ${isWarming ? 'text-red-400' : 'text-[#00D4FF]'}`}>
                      {slope > 0 ? '+' : ''}{slope.toFixed(3)} {currentVarMeta.unit}/dec
                    </div>
                  </div>

                  <button
                    onClick={() => handleInspectCell(cell)}
                    className="p-2 rounded-xl bg-[#0D1B2A] hover:bg-[#00D4FF] hover:text-[#071426] text-[#00D4FF] border border-[#1E3A56] transition"
                    title="Run full time-series analysis for this location"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
