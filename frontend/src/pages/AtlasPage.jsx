import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, GeoJSON, CircleMarker } from 'react-leaflet';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import {
  Play,
  Pause,
  ArrowRight,
  GitCompare,
  AlertTriangle,
  RotateCcw,
  Loader2,
  MapPin
} from 'lucide-react';
import { getAtlas, analyzeTrend } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import {
  Pill,
  GlassPanel,
  DivergingLegend,
  SignificanceBadge,
  TrendArrow,
  RangeSlider
} from '../components/ui';
import {
  getDivergingColor,
  findNearestOppositeCell,
  computeCellWindowSlope,
  formatSigned
} from '../utils/climateMath';

const VARIABLES = [
  { code: 'T2M', label: 'Temp', name: 'Air Temperature', unit: '°C', maxMag: 0.75 },
  { code: 'PRECTOTCORR', label: 'Rain', name: 'Precipitation', unit: 'mm/day', maxMag: 0.2 },
  { code: 'RH2M', label: 'Humidity', name: 'Relative Humidity', unit: '%', maxMag: 1.2 },
  { code: 'WS2M', label: 'Wind', name: 'Wind Speed', unit: 'm/s', maxMag: 0.3 },
  { code: 'ALLSKY_SFC_SW_DWN', label: 'Solar', name: 'Solar Irradiance', unit: 'MJ/m²', maxMag: 0.25 }
];

const NAMED_HUBS = [
  { name: 'Greenland / Arctic', lat: 72.0, lon: -40.0 },
  { name: 'Bengaluru, India', lat: 12.9716, lon: 77.5946 },
  { name: 'Amazon Basin', lat: -3.4653, lon: -62.2159 },
  { name: 'Sahel Region', lat: 14.4974, lon: 14.4524 },
  { name: 'SE United States', lat: 33.5, lon: -84.0 },
  { name: 'Western Europe', lat: 48.8, lon: 9.2 },
  { name: 'East Asia (Tokyo)', lat: 35.6762, lon: 139.6503 },
  { name: 'Murray-Darling, AU', lat: -34.0, lon: 142.0 }
];

const YEARS_LIST = Array.from({ length: 34 }, (_, i) => 1990 + i); // 1990..2023

function cellToPolygonFeature(cell, index) {
  const lat = cell.latitude;
  const lon = cell.longitude;
  const half = 2.5;
  return {
    type: 'Feature',
    id: index,
    properties: { ...cell, _idx: index },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [lon - half, lat - half],
          [lon + half, lat - half],
          [lon + half, lat + half],
          [lon - half, lat + half],
          [lon - half, lat - half]
        ]
      ]
    }
  };
}

export default function AtlasPage() {
  const { colors, theme } = useTheme();
  const navigate = useNavigate();

  const [selectedVar, setSelectedVar] = useState('T2M');
  const [metricMode, setMetricMode] = useState('trend'); // 'trend' | 'significance' | 'changepoint'
  const [startYear, setStartYear] = useState(1990);
  const [endYear, setEndYear] = useState(2023);
  const [isPlaying, setIsPlaying] = useState(false);

  const [atlasData, setAtlasData] = useState(null);
  const [loadingAtlas, setLoadingAtlas] = useState(true);
  const [atlasError, setAtlasError] = useState(null);

  const [selectedCell, setSelectedCell] = useState(null);
  const [regionDetail, setRegionDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const varMeta = VARIABLES.find((v) => v.code === selectedVar) || VARIABLES[0];

  const loadAtlasData = useCallback(
    async (bypassCache = false) => {
      setLoadingAtlas(true);
      setAtlasError(null);
      try {
        const res = await getAtlas(selectedVar, bypassCache);
        setAtlasData(res);
        if (res?.cells?.length) {
          // Default pick near Greenland or first notable significant cell if none chosen
          setSelectedCell((prev) => {
            if (prev) {
              const matching = res.cells.find(
                (c) => Math.abs(c.latitude - prev.latitude) < 2.6 && Math.abs(c.longitude - prev.longitude) < 2.6
              );
              if (matching) return matching;
            }
            return (
              res.cells.find((c) => Math.abs(c.latitude - 70) <= 5 && Math.abs(c.longitude + 40) <= 5) ||
              res.cells[Math.floor(res.cells.length * 0.72)] ||
              res.cells[0]
            );
          });
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setAtlasError('Atlas data for this variable has not been built.');
        } else if (
          !err.response ||
          err.code === 'ERR_NETWORK' ||
          err.code === 'ECONNABORTED' ||
          [502, 503, 504].includes(err.response?.status) ||
          (err.response?.status === 500 && !err.response?.data?.detail)
        ) {
          setAtlasError('Cannot reach the EarthPulse backend. Is it running on port 8000?');
        } else {
          setAtlasError(err.response?.data?.detail || err.message || 'Failed to load atlas data.');
        }
      } finally {
        setLoadingAtlas(false);
      }
    },
    [selectedVar]
  );

  useEffect(() => {
    loadAtlasData(false);
  }, [loadAtlasData]);

  // Playback loop advances endYear across historical decade window
  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = setInterval(() => {
      setEndYear((prev) => {
        const next = prev + 1;
        if (next > 2023) {
          return Math.max(startYear + 5, 2005);
        }
        return next;
      });
    }, 850);
    return () => clearInterval(timer);
  }, [isPlaying, startYear]);

  // Recompute / refetch selected region real NASA/cached trend when cell, variable, or window changes
  useEffect(() => {
    if (!selectedCell) return;
    let cancelled = false;
    setLoadingDetail(true);

    const locName =
      selectedCell.location_name ||
      `${Math.abs(selectedCell.latitude).toFixed(1)}°${selectedCell.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(
        selectedCell.longitude
      ).toFixed(1)}°${selectedCell.longitude >= 0 ? 'E' : 'W'}`;

    analyzeTrend({
      latitude: selectedCell.latitude,
      longitude: selectedCell.longitude,
      location_name: locName,
      variable: selectedVar,
      start_date: `${startYear}-01-01`,
      end_date: `${endYear}-12-31`,
      frequency: 'monthly'
    })
      .then((res) => {
        if (!cancelled) setRegionDetail(res);
      })
      .catch(() => {
        if (!cancelled) setRegionDetail(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCell, selectedVar, startYear, endYear]);

  // Window-adjusted grid cells & GeoJSON features
  const { adjustedCells, geoJsonCollection, nonSigCollection } = useMemo(() => {
    const rawCells = atlasData?.cells || [];
    const mapped = rawCells.map((c) => {
      const win = computeCellWindowSlope(c, startYear, endYear, 1990, 2023);
      return {
        ...c,
        window_slope: win.slope,
        window_significant: win.isSignificant,
        window_p: win.pValue
      };
    });

    const allFeatures = mapped.map((c, idx) => cellToPolygonFeature(c, idx));
    const nonSigFeatures = mapped
      .filter((c) => !c.window_significant)
      .map((c, idx) => cellToPolygonFeature(c, idx));

    return {
      adjustedCells: mapped,
      geoJsonCollection: { type: 'FeatureCollection', features: allFeatures },
      nonSigCollection: { type: 'FeatureCollection', features: nonSigFeatures }
    };
  }, [atlasData, startYear, endYear]);

  const selectedAdjusted = useMemo(() => {
    if (!selectedCell) return null;
    return (
      adjustedCells.find(
        (c) =>
          Math.abs(c.latitude - selectedCell.latitude) < 0.5 &&
          Math.abs(c.longitude - selectedCell.longitude) < 0.5
      ) || selectedCell
    );
  }, [adjustedCells, selectedCell]);

  // Nearest opposite trend region
  const oppositeNearby = useMemo(() => {
    if (!selectedAdjusted) return null;
    return findNearestOppositeCell(
      {
        ...selectedAdjusted,
        sens_slope_per_decade: selectedAdjusted.window_slope ?? selectedAdjusted.sens_slope_per_decade
      },
      adjustedCells.map((c) => ({
        ...c,
        sens_slope_per_decade: c.window_slope ?? c.sens_slope_per_decade,
        is_significant: c.window_significant ?? c.is_significant
      }))
    );
  }, [selectedAdjusted, adjustedCells]);

  // Histogram strip values across 1990..2023 based on global grid activity
  const yearlyHistogram = useMemo(() => {
    const baseMean = adjustedCells.length
      ? adjustedCells.reduce((acc, c) => acc + Math.abs(c.sens_slope_per_decade || 0), 0) /
        adjustedCells.length
      : 0.35;
    return YEARS_LIST.map((yr, i) => {
      const heightPct = Math.min(100, Math.max(18, Math.round(35 + baseMean * 85 * (0.6 + 0.4 * Math.sin(i * 0.45) + (i / 34) * 0.5))));
      const inRange = yr >= startYear && yr <= endYear;
      return { year: yr, heightPct, inRange };
    });
  }, [adjustedCells, startYear, endYear]);

  const styleGeoFeature = useCallback(
    (feature) => {
      const props = feature.properties;
      const slope = props.window_slope ?? props.sens_slope_per_decade ?? 0;
      const sig = props.window_significant ?? props.is_significant;

      let fillColor = getDivergingColor(slope, varMeta.maxMag, colors);
      if (metricMode === 'significance') {
        fillColor = sig ? colors.sig : colors.neutralCell;
      } else if (metricMode === 'changepoint') {
        // Highlight steep regime-shift cells in changepoint rose vs muted background
        fillColor = Math.abs(slope) > varMeta.maxMag * 0.55 && sig ? colors.changepoint : colors.neutralCell;
      }

      return {
        fillColor,
        fillOpacity: sig ? 0.88 : 0.45,
        color: colors.bg,
        weight: 0.4,
        opacity: 0.65
      };
    },
    [colors, varMeta.maxMag, metricMode]
  );

  const onEachFeature = useCallback((feature, layer) => {
    layer.on('click', () => {
      setSelectedCell(feature.properties);
    });
  }, []);

  const displayLabel = useMemo(() => {
    if (!selectedAdjusted) return 'Select region';
    if (selectedAdjusted.location_name && !selectedAdjusted.location_name.includes('°')) {
      return selectedAdjusted.location_name;
    }
    // Check if close to a known hub
    const nearHub = NAMED_HUBS.find(
      (h) =>
        Math.abs(h.lat - selectedAdjusted.latitude) <= 4 &&
        Math.abs(h.lon - selectedAdjusted.longitude) <= 4
    );
    if (nearHub) return nearHub.name;
    return (
      selectedAdjusted.location_name ||
      `${selectedAdjusted.latitude.toFixed(1)}°, ${selectedAdjusted.longitude.toFixed(1)}°`
    );
  }, [selectedAdjusted]);

  const activeSlopeDecade =
    regionDetail?.summary?.rate_per_decade ??
    selectedAdjusted?.window_slope ??
    selectedAdjusted?.sens_slope_per_decade ??
    0;

  const activePValue =
    regionDetail?.summary?.mann_kendall?.p_value ??
    selectedAdjusted?.window_p ??
    selectedAdjusted?.p_value ??
    0.05;

  const activeIsSig = regionDetail?.summary?.is_significant ?? selectedAdjusted?.window_significant ?? false;

  const drawerSeries = useMemo(() => {
    const yearly = regionDetail?.data?.yearly_averages;
    if (yearly && yearly.length > 0) {
      return yearly.map((d) => ({ x: String(d.year), val: d.mean_value }));
    }
    return [];
  }, [regionDetail]);

  return (
    <div
      className="relative w-full h-[calc(100vh-56px)] min-h-[660px] overflow-hidden select-none"
      style={{ backgroundColor: 'var(--sea)' }}
    >
      {/* Hidden SVG Diagonal Hatch Pattern Definition referenced by non-significant GeoJSON cells */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <pattern
            id="terra-atlas-hatch"
            width="6"
            height="6"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke={colors.text}
              strokeWidth="1.2"
              strokeOpacity="0.35"
            />
          </pattern>
        </defs>
      </svg>

      {/* Full-bleed Leaflet Choropleth Canvas (No Web Basemap Tiles; Pure Landmass Grid over Sea Color) */}
      <MapContainer
        key={`global-atlas-${theme}`}
        center={[22, 10]}
        zoom={2}
        minZoom={2}
        maxZoom={6}
        zoomControl={false}
        attributionControl={false}
        worldCopyJump={true}
        className="w-full h-full z-0"
        style={{ backgroundColor: colors.sea, borderRadius: 0 }}
      >
        {geoJsonCollection.features.length > 0 && (
          <GeoJSON
            key={`cells-${selectedVar}-${startYear}-${endYear}-${metricMode}-${theme}`}
            data={geoJsonCollection}
            style={styleGeoFeature}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Hatch overlay for non-significant regions when viewing Trend/Decade */}
        {metricMode === 'trend' && nonSigCollection.features.length > 0 && (
          <GeoJSON
            key={`hatch-${selectedVar}-${startYear}-${endYear}-${theme}`}
            data={nonSigCollection}
            interactive={false}
            style={{
              fillColor: 'url(#terra-atlas-hatch)',
              fillOpacity: 1,
              stroke: false
            }}
          />
        )}

        {/* Selected Region Ring Marker */}
        {selectedAdjusted && (
          <CircleMarker
            center={[selectedAdjusted.latitude, selectedAdjusted.longitude]}
            radius={9}
            pathOptions={{
              color: colors.accent,
              weight: 3,
              fillColor: colors.panel,
              fillOpacity: 0.25
            }}
          />
        )}
      </MapContainer>

      {/* Loading / Error State Overlay */}
      {loadingAtlas && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/25 backdrop-blur-xs pointer-events-none">
          <GlassPanel className="px-4 py-3 flex items-center gap-2.5 text-xs font-medium text-[var(--text)]">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
            <span>Rendering global trend grid...</span>
          </GlassPanel>
        </div>
      )}

      {atlasError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 p-6">
          <GlassPanel className="p-5 max-w-md text-center space-y-3">
            <AlertTriangle className="w-8 h-8 mx-auto" style={{ color: 'var(--warn)' }} />
            <h2 className="text-sm font-bold text-[var(--text)]">Atlas Grid Unavailable</h2>
            <p className="text-xs text-[var(--muted)] font-mono">{atlasError}</p>
            <button
              type="button"
              onClick={() => loadAtlasData(true)}
              className="px-4 py-1.5 rounded-[10px] bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-xs inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </GlassPanel>
        </div>
      )}

      {/* TOP-LEFT FLOATING PANEL: Variable Pills, Metric Pills & Legend */}
      <div className="absolute top-4 left-4 z-20 w-[calc(100%-2rem)] sm:w-[340px] space-y-2.5 pointer-events-auto">
        <GlassPanel className="p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-sm font-bold text-[var(--text)]">Global Trend Atlas</h1>
              <p className="text-[11px] text-[var(--muted)]">
                5° gridded continental records · {adjustedCells.length} cells
              </p>
            </div>
            {(atlasData?.is_simulated ?? true) && (
              <span
                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0"
                style={{
                  backgroundColor: 'var(--warn-soft)',
                  color: 'var(--warn)',
                  borderColor: 'var(--warn)'
                }}
              >
                Simulated Grid
              </span>
            )}
          </div>

          {/* Variable Pills */}
          <div className="flex flex-wrap gap-1" role="group" aria-label="Atlas environmental variable">
            {VARIABLES.map((v) => (
              <Pill
                key={v.code}
                size="sm"
                active={selectedVar === v.code}
                onClick={() => setSelectedVar(v.code)}
              >
                {v.label}
              </Pill>
            ))}
          </div>

          {/* Metric Mode Pills */}
          <div className="flex flex-wrap gap-1 pt-1 border-t border-[var(--border)]" role="group" aria-label="Atlas display metric">
            {[
              { id: 'trend', label: 'Trend / decade' },
              { id: 'significance', label: 'Significance' },
              { id: 'changepoint', label: 'Change-point' }
            ].map((m) => (
              <Pill
                key={m.id}
                size="sm"
                active={metricMode === m.id}
                onClick={() => setMetricMode(m.id)}
              >
                {m.label}
              </Pill>
            ))}
          </div>

          {/* Legend */}
          <div className="pt-1 border-t border-[var(--border)]">
            <DivergingLegend
              minLabel={`-${varMeta.maxMag}`}
              maxLabel={`+${varMeta.maxMag}`}
              unitLabel={`${varMeta.unit}/dec`}
              showHatch={metricMode === 'trend'}
            />
          </div>
        </GlassPanel>
      </div>

      {/* TOP-RIGHT FLOATING DRAWER: Selected Region Details & Opposite Trend Callout */}
      {selectedAdjusted && (
        <div className="hidden md:block absolute top-4 right-4 z-20 w-[330px] pointer-events-auto">
          <GlassPanel className="p-4 space-y-3">
            {/* Header: Region Name + Direction Pill */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--muted)]">
                  <MapPin className="w-3 h-3 text-[var(--accent)]" aria-hidden="true" />
                  <span>
                    {selectedAdjusted.latitude.toFixed(1)}°, {selectedAdjusted.longitude.toFixed(1)}°
                  </span>
                </div>
                <h2 className="text-sm font-bold text-[var(--text)] truncate" title={displayLabel}>
                  {displayLabel}
                </h2>
              </div>
              <TrendArrow
                value={activeSlopeDecade}
                unit={`${varMeta.unit}/dec`}
                decimals={2}
                isSignificant={activeIsSig}
                className="text-xs px-2 py-0.5 rounded-full bg-[var(--panel)] border border-[var(--border)] shrink-0"
              />
            </div>

            {/* Small Region Trend Chart */}
            <div className="h-24 w-full bg-[var(--panel)] rounded-[10px] border border-[var(--border)] p-1.5 relative">
              {loadingDetail && (
                <div className="absolute top-1.5 right-2 z-10 text-[10px] font-mono text-[var(--muted)]">
                  Updating...
                </div>
              )}
              {drawerSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={drawerSeries} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
                    <XAxis dataKey="x" hide />
                    <YAxis domain={['auto', 'auto']} fontSize={9} stroke={colors.muted} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="val"
                      stroke={activeSlopeDecade >= 0 ? colors.warm : colors.cool}
                      strokeWidth={1.8}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[11px] text-[var(--muted)]">
                  {loadingDetail ? 'Fetching point series...' : 'Grid summary loaded'}
                </div>
              )}
            </div>

            {/* Two Stat Tiles */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[var(--panel)] border border-[var(--border)] rounded-[10px] p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold">
                  Trend / decade
                </div>
                <div
                  className="text-base font-extrabold font-mono mt-0.5"
                  style={{ color: activeSlopeDecade >= 0 ? 'var(--warm)' : 'var(--cool)' }}
                >
                  {formatSigned(activeSlopeDecade, 2)} {varMeta.unit}
                </div>
              </div>
              <div className="bg-[var(--panel)] border border-[var(--border)] rounded-[10px] p-2.5 space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold">
                  Significant?
                </div>
                <SignificanceBadge isSignificant={activeIsSig} pValue={activePValue} />
                <div className="text-[10px] font-mono text-[var(--muted)]">p = {Number(activePValue).toFixed(4)}</div>
              </div>
            </div>

            {/* Amber Opposite Trend Nearby Callout */}
            {oppositeNearby && (
              <div
                className="p-2.5 rounded-[10px] border text-xs space-y-0.5"
                style={{
                  backgroundColor: 'var(--warn-soft)',
                  borderColor: 'var(--warn)',
                  color: 'var(--text)'
                }}
              >
                <div className="font-bold text-[11px] flex items-center gap-1" style={{ color: 'var(--warn)' }}>
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Opposite trend nearby ({oppositeNearby.distanceKm.toLocaleString()} km)</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-snug">
                  <strong className="text-[var(--text)]">
                    {oppositeNearby.cell.location_name ||
                      `${oppositeNearby.cell.latitude.toFixed(1)}°, ${oppositeNearby.cell.longitude.toFixed(1)}°`}
                  </strong>{' '}
                  trends in the opposite direction at{' '}
                  <span className="font-mono font-semibold text-[var(--text)]">
                    {formatSigned(oppositeNearby.slope, 2)} {varMeta.unit}/dec
                  </span>
                  .
                </p>
              </div>
            )}

            {/* Deep-link Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/investigate?var=${selectedVar}&lat=${selectedAdjusted.latitude}&lon=${selectedAdjusted.longitude}&loc=${encodeURIComponent(
                      displayLabel
                    )}&start=${startYear}&end=${endYear}`
                  )
                }
                className="py-2 px-3 rounded-[10px] bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-xs inline-flex items-center justify-center gap-1.5"
              >
                <span>Investigate</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate('/compare', {
                    state: {
                      variable: selectedVar,
                      regionA: {
                        name: displayLabel,
                        lat: selectedAdjusted.latitude,
                        lon: selectedAdjusted.longitude
                      },
                      regionB: oppositeNearby
                        ? {
                            name:
                              oppositeNearby.cell.location_name ||
                              `${oppositeNearby.cell.latitude.toFixed(1)}°, ${oppositeNearby.cell.longitude.toFixed(1)}°`,
                            lat: oppositeNearby.cell.latitude,
                            lon: oppositeNearby.cell.longitude
                          }
                        : undefined
                    }
                  })
                }
                className="py-2 px-3 rounded-[10px] bg-[var(--panel)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] font-semibold text-xs inline-flex items-center justify-center gap-1.5"
              >
                <GitCompare className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
                <span>Compare</span>
              </button>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* BOTTOM FLOATING TIMELINE CARD: Play button + Year Histogram + Dual-handle RangeSlider + Quick Ranges */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-center pointer-events-none">
        <GlassPanel className="pointer-events-auto w-full max-w-3xl p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? 'Pause timeline animation' : 'Play timeline animation'}
                className="w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center shrink-0"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </button>
              <div>
                <div className="text-xs font-bold text-[var(--text)] font-mono">
                  Window: {startYear}–{endYear}
                </div>
                <div className="text-[10px] text-[var(--muted)]">
                  Grid windowing + live point recalculation
                </div>
              </div>
            </div>

            {/* Quick Ranges */}
            <div className="flex items-center gap-1">
              {[
                { label: 'All years', s: 1990, e: 2023 },
                { label: 'Last 20', s: 2004, e: 2023 },
                { label: 'Last 10', s: 2014, e: 2023 }
              ].map((q) => (
                <Pill
                  key={q.label}
                  size="sm"
                  active={startYear === q.s && endYear === q.e}
                  onClick={() => {
                    setIsPlaying(false);
                    setStartYear(q.s);
                    setEndYear(q.e);
                  }}
                >
                  {q.label}
                </Pill>
              ))}
            </div>
          </div>

          {/* Histogram Strip of Years */}
          <div className="h-7 flex items-end gap-[2px]" aria-hidden="true">
            {yearlyHistogram.map((bar) => (
              <div
                key={bar.year}
                className="flex-1 rounded-t-[2px] transition-colors"
                style={{
                  height: `${bar.heightPct}%`,
                  backgroundColor: bar.inRange ? 'var(--accent)' : 'var(--border)',
                  opacity: bar.inRange ? 0.85 : 0.4
                }}
              />
            ))}
          </div>

          {/* Dual-Handle Slider */}
          <RangeSlider
            min={1990}
            max={2023}
            startValue={startYear}
            endValue={endYear}
            minSpan={5}
            onChange={(s, e) => {
              setIsPlaying(false);
              setStartYear(s);
              setEndYear(e);
            }}
            label="Atlas timeline range"
          />
        </GlassPanel>
      </div>
    </div>
  );
}
