import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  GitCompare,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Star,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import { MapContainer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import BaseTileLayer from '../config/mapTiles';
import { getAtlas, compareRegions, getPdfReportUrl } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import {
  Pill,
  SignificanceBadge,
  TrendArrow,
  DivergingLegend
} from '../components/ui';
import {
  BENCHMARK_REGIONS,
  haversineKm,
  getDivergingColor,
  getDivergingCellTextColor,
  computeCellWindowSlope,
  computeSlopeDifferenceTest,
  formatSigned
} from '../utils/climateMath';

const MATRIX_VARS = [
  { code: 'T2M', label: 'Air Temp', unit: '°C', maxMag: 0.75 },
  { code: 'PRECTOTCORR', label: 'Precip', unit: 'mm/d', maxMag: 0.2 },
  { code: 'RH2M', label: 'Rel. Humid.', unit: '%', maxMag: 1.2 },
  { code: 'WS2M', label: 'Wind Speed', unit: 'm/s', maxMag: 0.3 },
  { code: 'ALLSKY_SFC_SW_DWN', label: 'Solar Irrad.', unit: 'MJ/m²', maxMag: 0.25 }
];

const PERIOD_OPTIONS = [
  { id: '1990-2023', label: '1990–2023 (Full)', start: 1990, end: 2023 },
  { id: '2004-2023', label: '2004–2023 (20y)', start: 2004, end: 2023 },
  { id: '2014-2023', label: '2014–2023 (10y)', start: 2014, end: 2023 }
];

const RegionTooltip = memo(({ active, payload, label, unit, colors }) => {
  if (active && payload && payload.length) {
    const val = payload.find((p) => p.dataKey === 'val')?.value;
    const trend = payload.find((p) => p.dataKey === 'trend')?.value;
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] p-2.5 rounded-[10px] text-xs space-y-1 z-50">
        <div className="font-mono font-bold text-[var(--text)] border-b border-[var(--border)] pb-1">
          {label}
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[var(--muted)]">Observed:</span>
          <span className="font-mono font-semibold text-[var(--text)]">
            {val !== null && val !== undefined ? `${val} ${unit}` : 'N/A'}
          </span>
        </div>
        {trend !== undefined && trend !== null && (
          <div className="flex justify-between gap-3" style={{ color: colors.accent }}>
            <span>Sen&apos;s Trend:</span>
            <span className="font-mono font-semibold">{trend.toFixed(2)} {unit}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
});

function buildRegionSeriesWithTrend(rawSeries, nameKey, summary) {
  if (!rawSeries || rawSeries.length === 0) return [];
  const ols = summary?.linear_regression;
  const startTime = new Date(rawSeries[0].date).getTime();

  // Sample down slightly if huge while keeping clean line
  const step = rawSeries.length > 260 ? Math.ceil(rawSeries.length / 260) : 1;
  const result = [];
  for (let i = 0; i < rawSeries.length; i += step) {
    const row = rawSeries[i];
    const tMs = new Date(row.date).getTime();
    const yrs = (tMs - startTime) / (365.25 * 86400 * 1000);
    const trendVal = ols ? ols.intercept + ols.slope_per_year * yrs : null;
    result.push({
      date: row.date?.slice(0, 7) || '',
      val: row[nameKey],
      trend: trendVal !== null ? Number(trendVal.toFixed(2)) : null
    });
  }
  return result;
}

export default function ComparePage() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const initialVar = routerLocation.state?.variable || 'T2M';
  const initRegA = routerLocation.state?.regionA || BENCHMARK_REGIONS[1]; // Bengaluru
  const initRegB = routerLocation.state?.regionB || BENCHMARK_REGIONS[4]; // SE US (or Arctic)

  const [selectedVar, setSelectedVar] = useState(initialVar);
  const [periodId, setPeriodId] = useState('1990-2023');
  const [metricMode, setMetricMode] = useState('slope'); // 'slope' | 'total'
  const [onlySignificant, setOnlySignificant] = useState(false);
  const [showCustomMap, setShowCustomMap] = useState(false);

  const [regionA, setRegionA] = useState(initRegA);
  const [regionB, setRegionB] = useState(initRegB);
  const [nextAssignSlot, setNextAssignSlot] = useState('B'); // Alternates A/B when clicking matrix cells

  const [atlasByVar, setAtlasByVar] = useState({});
  const [loadingMatrix, setLoadingMatrix] = useState(true);

  const [compareResult, setCompareResult] = useState(null);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [compareError, setCompareError] = useState(null);

  const activePeriod = PERIOD_OPTIONS.find((p) => p.id === periodId) || PERIOD_OPTIONS[0];
  const activeVarMeta = MATRIX_VARS.find((v) => v.code === selectedVar) || MATRIX_VARS[0];

  // Fetch all 5 atlas grids once (fast cached local JSON reads) to populate Trend Matrix
  useEffect(() => {
    let cancelled = false;
    setLoadingMatrix(true);
    Promise.all(
      MATRIX_VARS.map((v) =>
        getAtlas(v.code)
          .then((res) => [v.code, res])
          .catch(() => [v.code, null])
      )
    ).then((entries) => {
      if (cancelled) return;
      const map = {};
      for (const [code, data] of entries) {
        if (data) map[code] = data;
      }
      setAtlasByVar(map);
      setLoadingMatrix(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Build Matrix lookup: matrix[varCode][regionId] = { slope, isSignificant, pValue, totalShift }
  const matrixData = useMemo(() => {
    const out = {};
    for (const v of MATRIX_VARS) {
      out[v.code] = {};
      const cells = atlasByVar[v.code]?.cells || [];
      for (const reg of BENCHMARK_REGIONS) {
        if (!cells.length) {
          out[v.code][reg.id] = { slope: 0, totalShift: 0, isSignificant: false, pValue: 1 };
          continue;
        }
        let nearest = cells[0];
        let bestDist = Infinity;
        for (const c of cells) {
          const d = haversineKm(reg.lat, reg.lon, c.latitude, c.longitude);
          if (d < bestDist) {
            bestDist = d;
            nearest = c;
          }
        }
        const win = computeCellWindowSlope(nearest, activePeriod.start, activePeriod.end, 1990, 2023);
        const decades = (activePeriod.end - activePeriod.start + 1) / 10;
        out[v.code][reg.id] = {
          slope: win.slope,
          totalShift: Number((win.slope * decades).toFixed(2)),
          isSignificant: win.isSignificant,
          pValue: win.pValue
        };
      }
    }
    return out;
  }, [atlasByVar, activePeriod]);

  // Execute live /api/compare for selected Region A vs Region B
  const runComparison = useCallback(async () => {
    setLoadingCompare(true);
    setCompareError(null);
    try {
      const res = await compareRegions({
        location_a: { name: regionA.name, latitude: regionA.lat, longitude: regionA.lon },
        location_b: { name: regionB.name, latitude: regionB.lat, longitude: regionB.lon },
        variable: selectedVar,
        start_date: `${activePeriod.start}-01-01`,
        end_date: `${activePeriod.end}-12-31`,
        frequency: 'monthly'
      });
      setCompareResult(res);
    } catch (err) {
      setCompareError(err.response?.data?.detail || err.message || 'Comparison request failed.');
    } finally {
      setLoadingCompare(false);
    }
  }, [regionA, regionB, selectedVar, activePeriod]);

  useEffect(() => {
    runComparison();
  }, [runComparison]);

  const handleMatrixCellClick = (varCode, reg) => {
    setSelectedVar(varCode);
    // Do not assign same region to both slots
    if (reg.id === regionA.id || reg.id === regionB.id) {
      return;
    }
    if (nextAssignSlot === 'A') {
      setRegionA(reg);
      setNextAssignSlot('B');
    } else {
      setRegionB(reg);
      setNextAssignSlot('A');
    }
  };

  // Ranked Biggest Movers + Auto-generated Diverging Trends summary for active variable
  const { biggestMovers, divergenceNarrative } = useMemo(() => {
    const row = matrixData[selectedVar] || {};
    const list = BENCHMARK_REGIONS.map((reg) => ({
      ...reg,
      ...(row[reg.id] || { slope: 0, totalShift: 0, isSignificant: false, pValue: 1 })
    })).sort((a, b) => Math.abs(b.slope) - Math.abs(a.slope));

    const positives = list.filter((r) => r.slope > 0.005);
    const negatives = list.filter((r) => r.slope < -0.005);
    let summaryText = '';

    if (positives.length > 0 && negatives.length > 0) {
      const maj = positives.length >= negatives.length ? positives : negatives;
      const min = positives.length >= negatives.length ? negatives : positives;
      const majVerb = positives.length >= negatives.length ? 'rises' : 'falls';
      const minVerb = positives.length >= negatives.length ? 'falls' : 'rises';
      summaryText = `${activeVarMeta.label} ${majVerb} in ${maj.length} of ${list.length} regions, but ${minVerb} in ${min
        .map((m) => `${m.short} (${formatSigned(m.slope, 2)})`)
        .join(', ')}.`;
    } else if (list.length > 1) {
      const fastest = list[0];
      const slowest = list[list.length - 1];
      summaryText = `All ${list.length} tracked regions move in the same direction for ${activeVarMeta.label}, ranging from ${formatSigned(
        slowest.slope,
        2
      )} (${slowest.short}) to ${formatSigned(fastest.slope, 2)} ${activeVarMeta.unit}/dec (${fastest.short}).`;
    }

    return { biggestMovers: list, divergenceNarrative: summaryText };
  }, [matrixData, selectedVar, activeVarMeta]);

  const seriesA = useMemo(
    () =>
      buildRegionSeriesWithTrend(
        compareResult?.comparison_time_series,
        regionA.name,
        compareResult?.location_a
      ),
    [compareResult, regionA.name]
  );

  const seriesB = useMemo(
    () =>
      buildRegionSeriesWithTrend(
        compareResult?.comparison_time_series,
        regionB.name,
        compareResult?.location_b
      ),
    [compareResult, regionB.name]
  );

  const diffTest = useMemo(
    () => computeSlopeDifferenceTest(compareResult?.location_a, compareResult?.location_b),
    [compareResult]
  );

  const pinIconA = useMemo(
    () =>
      L.divIcon({
        className: 'terra-pin-a',
        html: `<div style="width:22px;height:22px;border-radius:50%;background:${colors.accent};color:${colors.accentFg};border:2px solid ${colors.panel};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;">A</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      }),
    [colors]
  );

  const pinIconB = useMemo(
    () =>
      L.divIcon({
        className: 'terra-pin-b',
        html: `<div style="width:22px;height:22px;border-radius:50%;background:${colors.cool};color:#ffffff;border:2px solid ${colors.panel};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;">B</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      }),
    [colors]
  );

  const slopeADecade = (compareResult?.location_a?.sens_slope_per_year ?? 0) * 10;
  const slopeBDecade = (compareResult?.location_b?.sens_slope_per_year ?? 0) * 10;
  const unitLabel = compareResult?.unit || activeVarMeta.unit;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
            Trend Matrix &amp; Divergence Lab
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight">
            Where Does the Same Variable Diverge?
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomMap((s) => !s)}
          className="px-3 py-1.5 rounded-full bg-[var(--panel)] border border-[var(--border)] text-xs font-medium text-[var(--text)] hover:border-[var(--accent)] inline-flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
          <span>{showCustomMap ? 'Hide Pin Map' : 'Show Region Pins Map'}</span>
        </button>
      </div>

      {/* TOP CARD: Variables (Rows) x Regions (Columns) Matrix */}
      <section
        aria-label="Global Variables by Regions Trend Matrix"
        className="bg-[var(--card)] border border-[var(--border)] rounded-[14px] p-4 sm:p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-[var(--text)]">
              Multi-Variable Regional Trend Matrix
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Click any two cells to pair Region A &amp; Region B below. ★ denotes p &lt; 0.05 (95% confidence).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Period Selector Pills */}
            <div className="flex items-center gap-1" role="group" aria-label="Matrix period">
              {PERIOD_OPTIONS.map((p) => (
                <Pill
                  key={p.id}
                  size="sm"
                  active={periodId === p.id}
                  onClick={() => setPeriodId(p.id)}
                >
                  {p.label}
                </Pill>
              ))}
            </div>

            {/* Metric Toggle */}
            <div className="flex items-center gap-1" role="group" aria-label="Matrix metric">
              <Pill size="sm" active={metricMode === 'slope'} onClick={() => setMetricMode('slope')}>
                Rate / dec
              </Pill>
              <Pill size="sm" active={metricMode === 'total'} onClick={() => setMetricMode('total')}>
                Total Δ
              </Pill>
            </div>

            {/* Only Significant Filter Toggle */}
            <Pill
              size="sm"
              icon={Filter}
              active={onlySignificant}
              onClick={() => setOnlySignificant((v) => !v)}
            >
              Only significant
            </Pill>
          </div>
        </div>

        {/* Matrix Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-1.5 text-xs">
            <thead>
              <tr>
                <th className="text-left font-semibold text-[var(--muted)] px-2 py-1 w-36">
                  Variable
                </th>
                {BENCHMARK_REGIONS.map((reg) => {
                  const isA = reg.id === regionA.id;
                  const isB = reg.id === regionB.id;
                  return (
                    <th key={reg.id} className="text-center font-semibold text-[var(--text)] px-1 py-1">
                      <div className="inline-flex items-center gap-1">
                        <span>{reg.short}</span>
                        {isA && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] font-mono text-[10px] font-bold">
                            A
                          </span>
                        )}
                        {isB && (
                          <span
                            className="px-1.5 py-0.2 rounded-full text-white font-mono text-[10px] font-bold"
                            style={{ backgroundColor: colors.cool }}
                          >
                            B
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {MATRIX_VARS.map((v) => {
                const isActiveRow = v.code === selectedVar;
                return (
                  <tr key={v.code}>
                    <td className="px-2 py-1.5 align-middle">
                      <button
                        type="button"
                        onClick={() => setSelectedVar(v.code)}
                        className={`text-left w-full px-2 py-1 rounded-[8px] border transition-colors ${
                          isActiveRow
                            ? 'border-[var(--accent)] bg-[var(--accent-soft)] font-bold text-[var(--text)]'
                            : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                        }`}
                      >
                        <div className="text-xs leading-tight">{v.label}</div>
                        <div className="text-[10px] font-mono opacity-75">
                          {v.code} ({v.unit})
                        </div>
                      </button>
                    </td>

                    {BENCHMARK_REGIONS.map((reg) => {
                      const cell = matrixData[v.code]?.[reg.id] || {
                        slope: 0,
                        totalShift: 0,
                        isSignificant: false
                      };
                      const val = metricMode === 'slope' ? cell.slope : cell.totalShift;
                      const maxVal =
                        metricMode === 'slope'
                          ? v.maxMag
                          : v.maxMag * ((activePeriod.end - activePeriod.start + 1) / 10);
                      const dimmed = onlySignificant && !cell.isSignificant;
                      const isSelected = isActiveRow && (reg.id === regionA.id || reg.id === regionB.id);
                      const bg = dimmed ? 'var(--panel)' : getDivergingColor(val, maxVal, colors);
                      const fg = dimmed ? 'var(--muted)' : getDivergingCellTextColor(val, maxVal, colors);

                      return (
                        <td key={reg.id} className="p-0">
                          <button
                            type="button"
                            onClick={() => handleMatrixCellClick(v.code, reg)}
                            aria-label={`${v.label} in ${reg.name}: ${formatSigned(val, 2)} ${v.unit}${
                              cell.isSignificant ? ', statistically significant' : ''
                            }`}
                            className={`w-full py-2.5 px-1.5 rounded-[10px] font-mono text-xs font-semibold flex items-center justify-center gap-0.5 transition-all ${
                              isSelected
                                ? 'ring-2 ring-[var(--text)] ring-offset-2 ring-offset-[var(--card)]'
                                : 'border border-[var(--border)] hover:border-[var(--text)]'
                            }`}
                            style={{
                              backgroundColor: bg,
                              color: fg,
                              opacity: dimmed ? 0.45 : 1
                            }}
                          >
                            <span>{formatSigned(val, 2)}</span>
                            {cell.isSignificant && (
                              <Star className="w-2.5 h-2.5 fill-current shrink-0" aria-hidden="true" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
          <div className="w-full sm:w-72">
            <DivergingLegend
              minLabel={`-${activeVarMeta.maxMag}`}
              maxLabel={`+${activeVarMeta.maxMag}`}
              unitLabel={`${activeVarMeta.unit}/dec`}
              showHatch={false}
            />
          </div>
          {loadingMatrix && (
            <span className="text-xs font-mono text-[var(--muted)] flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
              <span>Syncing 5 atlas grids...</span>
            </span>
          )}
        </div>
      </section>

      {/* Optional Region Pins Locator Map */}
      {showCustomMap && (
        <div className="h-64 w-full rounded-[14px] overflow-hidden border border-[var(--border)]">
          <MapContainer
            key={`compare-pins-${regionA.lat}-${regionB.lat}`}
            center={[(regionA.lat + regionB.lat) / 2, (regionA.lon + regionB.lon) / 2]}
            zoom={2}
            minZoom={2}
            maxZoom={16}
            scrollWheelZoom={false}
            className="w-full h-full z-0"
          >
            <BaseTileLayer />
            <Marker position={[regionA.lat, regionA.lon]} icon={pinIconA}>
              <Popup>Region A: {regionA.name}</Popup>
            </Marker>
            <Marker position={[regionB.lat, regionB.lon]} icon={pinIconB}>
              <Popup>Region B: {regionB.name}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {/* MAIN COMPARISON SPLIT: Side-by-Side Region Cards + Right Insights Column */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
        {/* LEFT: Two Side-by-Side Region Cards (Region A & Region B) */}
        <div className="space-y-4">
          {compareError && (
            <div
              className="p-4 rounded-[14px] border text-xs flex items-center justify-between gap-3"
              style={{ backgroundColor: 'var(--warm-soft)', borderColor: 'var(--warm)' }}
            >
              <span>{compareError}</span>
              <button
                type="button"
                onClick={runComparison}
                className="px-3 py-1 rounded-[8px] bg-[var(--accent)] text-[var(--accent-fg)] font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                slot: 'A',
                reg: regionA,
                summary: compareResult?.location_a,
                slopeDecade: slopeADecade,
                series: seriesA
              },
              {
                slot: 'B',
                reg: regionB,
                summary: compareResult?.location_b,
                slopeDecade: slopeBDecade,
                series: seriesB
              }
            ].map((item) => {
              const dirColor =
                !item.summary?.is_significant
                  ? colors.border
                  : item.slopeDecade >= 0
                  ? colors.warm
                  : colors.cool;

              return (
                <div
                  key={item.slot}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-[14px] p-4 space-y-3"
                  style={{ borderTopWidth: '3px', borderTopColor: dirColor }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                        <span className="px-1.5 py-0.2 rounded bg-[var(--card-subtle)] border border-[var(--border)] font-bold text-[var(--text)]">
                          Region {item.slot}
                        </span>
                        <span>
                          {item.reg.lat.toFixed(1)}°, {item.reg.lon.toFixed(1)}°
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[var(--text)] mt-1">{item.reg.name}</h3>
                    </div>

                    {item.summary && (
                      <SignificanceBadge
                        isSignificant={item.summary.is_significant}
                        pValue={item.summary.mann_kendall?.p_value}
                      />
                    )}
                  </div>

                  {/* Big Signed Slope + P-value */}
                  {loadingCompare && !item.summary ? (
                    <div className="h-14 animate-pulse bg-[var(--card-subtle)] rounded-[10px]" />
                  ) : (
                    <div className="flex items-baseline justify-between gap-2 pb-2 border-b border-[var(--border)]">
                      <TrendArrow
                        value={item.slopeDecade}
                        unit={`${unitLabel}/dec`}
                        decimals={2}
                        isSignificant={Boolean(item.summary?.is_significant)}
                        className="text-2xl font-extrabold tracking-tight"
                      />
                      <span className="text-xs font-mono text-[var(--muted)]">
                        p = {item.summary?.mann_kendall?.p_value?.toFixed(4) ?? '—'}
                      </span>
                    </div>
                  )}

                  {/* Region Time Series + Sen's Slope Line */}
                  <div className="h-52 w-full">
                    {item.series.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={item.series} margin={{ top: 6, right: 10, left: -16, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                          <XAxis
                            dataKey="date"
                            stroke={colors.muted}
                            fontSize={10}
                            tickFormatter={(v) => (v ? v.slice(0, 4) : '')}
                            minTickGap={35}
                            tickLine={{ stroke: colors.border }}
                          />
                          <YAxis
                            stroke={colors.muted}
                            fontSize={10}
                            domain={['auto', 'auto']}
                            tickLine={{ stroke: colors.border }}
                          />
                          <Tooltip content={<RegionTooltip unit={unitLabel} colors={colors} />} />
                          <Line
                            type="monotone"
                            dataKey="val"
                            stroke={colors.obs}
                            strokeWidth={1.3}
                            dot={false}
                            isAnimationActive={false}
                          />
                          <Line
                            type="linear"
                            dataKey="trend"
                            stroke={item.slopeDecade >= 0 ? colors.warm : colors.cool}
                            strokeWidth={2.2}
                            strokeDasharray="5 4"
                            dot={false}
                            isAnimationActive={false}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-[var(--muted)]">
                        {loadingCompare ? 'Loading comparison time series...' : 'No series data'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Biggest Movers + Diverging Trends Callout + Difference Test */}
        <aside className="space-y-4">
          {/* 1. Auto-generated Diverging Trends Amber Callout */}
          {divergenceNarrative && (
            <div
              className="rounded-[14px] border p-4 space-y-1.5"
              style={{
                backgroundColor: 'var(--warn-soft)',
                borderColor: 'var(--warn)'
              }}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--warn)' }}>
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Diverging Trends</span>
              </div>
              <p className="text-xs text-[var(--text)] leading-relaxed">{divergenceNarrative}</p>
              {selectedVar === 'T2M' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVar('PRECTOTCORR');
                    setRegionA(BENCHMARK_REGIONS[2]);
                    setRegionB(BENCHMARK_REGIONS[3]);
                  }}
                  className="text-[11px] font-semibold underline hover:opacity-80 pt-0.5 block"
                  style={{ color: 'var(--warn)' }}
                >
                  Inspect opposite rainfall trends (Amazon vs Sahel) →
                </button>
              )}
            </div>
          )}

          {/* 2. Biggest Movers Ranked List */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[14px] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Biggest Movers · {activeVarMeta.label}
              </h3>
              <span className="text-[10px] font-mono text-[var(--muted)]">{activeVarMeta.unit}/dec</span>
            </div>

            <div className="space-y-1.5">
              {biggestMovers.map((item) => {
                const barColor = item.slope >= 0 ? colors.warm : colors.cool;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleMatrixCellClick(selectedVar, item)}
                    className="w-full text-left flex items-center justify-between gap-2 p-2 rounded-[10px] bg-[var(--panel)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-1 h-5 rounded-full shrink-0"
                        style={{ backgroundColor: barColor }}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-[var(--text)] truncate">{item.name}</span>
                    </div>
                    <TrendArrow
                      value={item.slope}
                      decimals={2}
                      isSignificant={item.isSignificant}
                      className="text-xs shrink-0"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Difference Test Card */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[14px] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Difference Test (A − B)
              </span>
              {diffTest && (
                <SignificanceBadge
                  isSignificant={diffTest.isSignificant}
                  pValue={diffTest.pValue}
                />
              )}
            </div>

            {diffTest ? (
              <div className="space-y-1">
                <div className="text-2xl font-extrabold font-mono tracking-tight text-[var(--text)]">
                  {formatSigned(diffTest.deltaPerDecade, 2)}{' '}
                  <span className="text-xs font-normal text-[var(--muted)]">{unitLabel}/dec</span>
                </div>
                <div className="text-xs font-mono text-[var(--muted)]">
                  Z = {diffTest.zStatistic.toFixed(2)} · p = {diffTest.pValue.toFixed(4)}
                </div>
              </div>
            ) : (
              <div className="text-xs text-[var(--muted)]">Computing slope differential...</div>
            )}

            <div className="pt-2 border-t border-[var(--border)] flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/investigate?var=${selectedVar}&lat=${regionA.lat}&lon=${regionA.lon}&loc=${encodeURIComponent(
                      regionA.name
                    )}&start=${activePeriod.start}&end=${activePeriod.end}`
                  )
                }
                className="flex-1 py-2 px-3 rounded-[10px] bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-xs inline-flex items-center justify-center gap-1.5"
              >
                <span>Open full report</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <a
                href={getPdfReportUrl({
                  latitude: regionA.lat,
                  longitude: regionA.lon,
                  location_name: regionA.name,
                  variable: selectedVar,
                  start_date: `${activePeriod.start}-01-01`,
                  end_date: `${activePeriod.end}-12-31`,
                  frequency: 'monthly'
                })}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-[10px] bg-[var(--panel)] border border-[var(--border)] text-xs font-medium text-[var(--text)] hover:border-[var(--accent)]"
              >
                PDF
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
