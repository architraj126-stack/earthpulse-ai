import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Globe, Filter, AlertCircle, Loader2, Sparkles, MapPin } from 'lucide-react';
import { getAtlas } from '../../services/api';

const atlasPinIcon = L.divIcon({
  className: 'earthpulse-atlas-pin',
  html: `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; transform: translateY(-10px);">
      <div style="width: 22px; height: 22px; border-radius: 50%; background: rgba(0, 212, 255, 0.4); border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(0, 212, 255, 0.8);">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #00D4FF;"></div>
      </div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 24]
});

// Canvas Grid Renderer Component inside Leaflet
function AtlasCanvasOverlay({
  cells,
  variable,
  unit,
  onCellClick,
  highlightCoords
}) {
  const map = useMap();
  const canvasRef = useRef(null);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cells || cells.length === 0) return;

    const ctx = canvas.getContext('2d');
    const { x: width, y: height } = map.getSize();
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    // Dynamic color scaling bounds based on variable
    const maxSlope = variable === 'T2M' ? 0.75 : (variable === 'PRECTOTCORR' ? 0.2 : 1.2);

    cells.forEach((cell) => {
      const pt = map.latLngToContainerPoint([cell.latitude, cell.longitude]);
      // Skip if off-screen with margin
      if (pt.x < -30 || pt.x > width + 30 || pt.y < -30 || pt.y > height + 30) return;

      const slope = cell.sens_slope_per_decade ?? cell.sen_slope_per_decade ?? 0;
      const norm = Math.min(1.0, Math.max(0.05, Math.abs(slope) / maxSlope));

      let fillColor;
      if (!cell.is_significant) {
        fillColor = `rgba(148, 163, 184, 0.25)`; // Muted grey
      } else if (slope > 0) {
        // Diverging Red / Orange
        fillColor = `rgba(239, 68, 68, ${0.35 + norm * 0.55})`;
      } else {
        // Diverging Blue / Cyan
        fillColor = `rgba(0, 212, 255, ${0.35 + norm * 0.55})`;
      }

      const radius = Math.max(4, Math.min(16, 5 * (map.getZoom() / 3)));

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Draw dot for statistically significant cells
      if (cell.is_significant) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }
    });
  }, [map, cells, variable]);

  useEffect(() => {
    drawCanvas();
    map.on('move', drawCanvas);
    map.on('zoom', drawCanvas);
    map.on('resize', drawCanvas);

    return () => {
      map.off('move', drawCanvas);
      map.off('zoom', drawCanvas);
      map.off('resize', drawCanvas);
    };
  }, [map, drawCanvas]);

  // Click detection: find closest grid cell within click radius
  useMapEvents({
    click: (e) => {
      if (!cells || cells.length === 0) return;
      const clickPt = map.latLngToContainerPoint(e.latlng);
      let closestCell = null;
      let minDistance = 24; // Pixel threshold

      for (const cell of cells) {
        const pt = map.latLngToContainerPoint([cell.latitude, cell.longitude]);
        const dist = Math.hypot(clickPt.x - pt.x, clickPt.y - pt.y);
        if (dist < minDistance) {
          minDistance = dist;
          closestCell = cell;
        }
      }

      if (closestCell) {
        onCellClick(closestCell);
      } else {
        // Fallback to exact clicked coordinate
        onCellClick({
          latitude: parseFloat(e.latlng.lat.toFixed(4)),
          longitude: parseFloat(e.latlng.lng.toFixed(4)),
          location_name: `Location (${e.latlng.lat.toFixed(2)}°, ${e.latlng.lng.toFixed(2)}°)`
        });
      }
    }
  });

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-[400]"
    />
  );
}

const SUPPORTED_VARIABLES = [
  { code: 'T2M', name: 'Temperature', unit: '°C' },
  { code: 'PRECTOTCORR', name: 'Precipitation', unit: 'mm/day' },
  { code: 'RH2M', name: 'Relative Humidity', unit: '%' },
  { code: 'WS2M', name: 'Wind Speed', unit: 'm/s' },
  { code: 'ALLSKY_SFC_SW_DWN', name: 'Solar Radiation', unit: 'kW-hr/m²/day' }
];

export default memo(function GlobalTrendMapView({
  selectedLocation,
  onLocationChange,
  activeVariable = 'T2M'
}) {
  const [atlasVar, setAtlasVar] = useState(activeVariable);
  const [atlasData, setAtlasData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { latitude, longitude, name } = selectedLocation;

  const loadAtlas = useCallback(async (bypassCache = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAtlas(atlasVar, bypassCache);
      setAtlasData(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Atlas data for this variable has not been built.');
      } else if (
        !err.response ||
        err.code === 'ERR_NETWORK' ||
        err.code === 'ECONNABORTED' ||
        [502, 503, 504].includes(err.response?.status) ||
        (err.response?.status === 500 && !err.response?.data?.detail)
      ) {
        setError('Cannot reach the EarthPulse backend. Is it running on port 8000?');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to load Atlas data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [atlasVar]);

  useEffect(() => {
    loadAtlas(false);
  }, [loadAtlas]);

  const handleCellSelect = (cell) => {
    const locName = cell.location_name || `Grid Cell (${cell.latitude}°, ${cell.longitude}°)`;
    onLocationChange(locName, cell.latitude, cell.longitude);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Header & Variable Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#0D1B2A] p-2.5 rounded-xl border border-[#1E3A56] text-xs">
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-[#00D4FF] shrink-0" />
            <span className="font-semibold text-white">Illustrative Global Trend Atlas (simulated)</span>
            <span className="text-slate-400 font-mono">
              {atlasData ? `(${atlasData.cell_count || atlasData.cells?.length || 0} cells)` : ''}
            </span>
          </div>
          {(atlasData?.is_simulated ?? true) && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold">
              Simulated demo data
            </span>
          )}
        </div>

        {/* Variable Switcher */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={atlasVar}
            onChange={(e) => setAtlasVar(e.target.value)}
            className="bg-[#13263A] border border-[#1E3A56] rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-[#00D4FF]"
          >
            {SUPPORTED_VARIABLES.map((v) => (
              <option key={v.code} value={v.code}>
                {v.name} ({v.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full min-h-[420px] rounded-xl overflow-hidden border border-[#1E3A56] relative">
        {isLoading && (
          <div className="absolute inset-0 z-[1000] bg-[#071426]/75 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 text-[#00D4FF] animate-spin" />
            <span className="text-sm text-slate-300 font-medium">Loading 5° Global Trend Atlas...</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-[1000] bg-[#071426]/90 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-400" />
            <h4 className="text-base font-semibold text-white">Unable to Load Atlas</h4>
            <p className="text-xs text-slate-300 max-w-md font-mono">{error}</p>
            <button
              type="button"
              onClick={() => loadAtlas(true)}
              className="mt-2 px-4 py-1.5 bg-[#00D4FF] hover:bg-[#00D4FF]/80 text-[#071426] font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5"
            >
              <span>Retry</span>
            </button>
          </div>
        )}

        <MapContainer
          key={`atlas-map-${atlasVar}`}
          center={[latitude, longitude]}
          zoom={2}
          minZoom={2}
          maxZoom={7}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            maxZoom={19}
            subdomains="abcd"
          />

          {atlasData?.cells && (
            <AtlasCanvasOverlay
              cells={atlasData.cells}
              variable={atlasVar}
              unit={atlasData.unit}
              onCellClick={handleCellSelect}
              highlightCoords={[latitude, longitude]}
            />
          )}

          <Marker position={[latitude, longitude]} icon={atlasPinIcon} />
        </MapContainer>

        {/* Diverging Colormap Legend */}
        <div className="absolute bottom-3 right-3 z-[1000] bg-[#071426]/95 border border-[#1E3A56] p-3 rounded-xl text-xs space-y-1.5 shadow-xl max-w-[260px]">
          <div className="font-semibold text-white flex items-center justify-between">
            <span>Sen's Slope per Decade</span>
            <span className="text-[#00D4FF] font-mono">{atlasData?.unit || '°C'}/dec</span>
          </div>

          <div className="h-3 w-full rounded-full bg-gradient-to-r from-[#00D4FF] via-slate-500 to-[#EF4444]" />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Negative (Cooling/Drying)</span>
            <span>0</span>
            <span>Positive (Warming/Wetting)</span>
          </div>

          <div className="flex items-center space-x-2 pt-1 border-t border-[#1E3A56]/60 text-[11px] text-slate-300">
            <div className="w-2 h-2 rounded-full bg-white border border-slate-900 shrink-0"></div>
            <span>White dot: Statistically Significant (p &lt; 0.05)</span>
          </div>
        </div>

        {/* Selected Location Pill */}
        <div className="absolute top-3 left-3 z-[1000] bg-[#071426]/95 border border-[#1E3A56] px-3 py-1.5 rounded-xl text-xs flex items-center space-x-2 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-[#00D4FF]" />
          <span className="truncate max-w-[180px] font-medium text-white">{name}</span>
          <span className="text-[#00D4FF] font-mono">({latitude.toFixed(2)}°, {longitude.toFixed(2)}°)</span>
        </div>
      </div>
    </div>
  );
});
