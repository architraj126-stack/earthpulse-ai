import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  AlertTriangle,
  Loader2,
  Share2,
  Check,
  RotateCcw,
  Info,
  Play,
  Compass,
  Activity
} from 'lucide-react';
import {
  getVariables,
  analyzeTrend,
  getAtlas,
  getPdfReportUrl,
  getCsvExportUrl
} from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import {
  Pill,
  VerdictCard,
  SignificanceBadge,
  TrendArrow,
  RangeSlider
} from '../components/ui';
import VariableSelector from '../components/VariableSelector';
import LocationMiniMap from '../components/map/LocationMiniMap';
import TimeSeriesChart from '../components/TimeSeriesChart';
import YearlyChart from '../components/YearlyChart';
import SeasonalChart from '../components/SeasonalChart';
import SeasonalFingerprint from '../components/SeasonalFingerprint';
import AskEarthPulseSection from '../components/AskEarthPulseSection';
import { haversineKm, formatSigned } from '../utils/climateMath';

const QUICK_PLACES = [
  { name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946 },
  { name: 'Greenland Ice Sheet', lat: 72.0, lon: -40.0 },
  { name: 'Sahel Region', lat: 14.4974, lon: 14.4524 },
  { name: 'Amazon Basin', lat: -3.4653, lon: -62.2159 }
];

export default function DashboardPage() {
  const routerLocation = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { colors } = useTheme();

  // Initial URL / Navigation state
  const initialVariable = searchParams.get('var') || routerLocation.state?.variable || 'T2M';
  const initialLat = searchParams.get('lat')
    ? parseFloat(searchParams.get('lat'))
    : routerLocation.state?.latitude ?? 12.9716;
  const initialLon = searchParams.get('lon')
    ? parseFloat(searchParams.get('lon'))
    : routerLocation.state?.longitude ?? 77.5946;
  const initialLocName =
    searchParams.get('loc') || routerLocation.state?.locationName || 'Bengaluru, Karnataka';
  const initialStartYear = searchParams.get('start')
    ? parseInt(searchParams.get('start'), 10)
    : routerLocation.state?.startYear ?? 1990;
  const initialEndYear = searchParams.get('end')
    ? parseInt(searchParams.get('end'), 10)
    : routerLocation.state?.endYear ?? 2023;
  const initialFreq = searchParams.get('freq') || 'monthly';

  // Form / Stepper State
  const [selectedVariable, setSelectedVariable] = useState(initialVariable);
  const [locationName, setLocationName] = useState(initialLocName);
  const [latitude, setLatitude] = useState(initialLat);
  const [longitude, setLongitude] = useState(initialLon);
  const [startYear, setStartYear] = useState(initialStartYear);
  const [endYear, setEndYear] = useState(initialEndYear);
  const [frequency, setFrequency] = useState(initialFreq);
  const [activeTab, setActiveTab] = useState('timeseries'); // 'timeseries' | 'seasonal' | 'yearly' | 'anomaly' | 'export'
  const [copiedLink, setCopiedLink] = useState(false);

  // Data States
  const [variables, setVariables] = useState([]);
  const [atlasData, setAtlasData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = useCallback(
    async (customPayload = null) => {
      setLoading(true);
      setError(null);

      const payload = customPayload || {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        location_name: locationName,
        variable: selectedVariable,
        start_date: `${startYear}-01-01`,
        end_date: `${endYear}-12-31`,
        frequency
      };

      setSearchParams(
        {
          var: payload.variable,
          lat: String(payload.latitude),
          lon: String(payload.longitude),
          loc: payload.location_name,
          start: String(payload.start_date.slice(0, 4)),
          end: String(payload.end_date.slice(0, 4)),
          freq: payload.frequency
        },
        { replace: true }
      );

      try {
        const data = await analyzeTrend(payload);
        setAnalysisResult(data);
      } catch (err) {
        setError(
          err.response?.data?.detail || err.message || 'Analysis pipeline could not complete.'
        );
      } finally {
        setLoading(false);
      }
    },
    [latitude, longitude, locationName, selectedVariable, startYear, endYear, frequency, setSearchParams]
  );

  // Initial mount fetch
  useEffect(() => {
    getVariables()
      .then((vars) => setVariables(vars || []))
      .catch(() => {});

    runAnalysis({
      latitude: initialLat,
      longitude: initialLon,
      location_name: initialLocName,
      variable: initialVariable,
      start_date: `${initialStartYear}-01-01`,
      end_date: `${initialEndYear}-12-31`,
      frequency: initialFreq
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load atlas grid for selected variable (mini-map choropleth + WHERE baseline comparison)
  useEffect(() => {
    getAtlas(selectedVariable)
      .then((res) => setAtlasData(res))
      .catch(() => setAtlasData(null));
  }, [selectedVariable]);

  const handleMapLocationChange = useCallback((name, lat, lon) => {
    setLocationName(name);
    setLatitude(lat);
    setLongitude(lon);
  }, []);

  const copyShareableLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const summary = analysisResult?.summary;
  const timeSeriesData = analysisResult?.data?.time_series || [];
  const yearlyData = analysisResult?.data?.yearly_averages || [];
  const monthlyData = analysisResult?.data?.monthly_variation || [];

  const activeVarMeta = useMemo(
    () =>
      variables.find((v) => v.parameter === (summary?.variable || selectedVariable)) || {
        name: 'Temperature at 2 Metres',
        short_name: 'Air Temperature',
        unit: '°C',
        parameter: selectedVariable
      },
    [variables, summary?.variable, selectedVariable]
  );

  // Compute WHERE regional baseline comparison against nearest atlas cell & global mean
  const regionalComparisonText = useMemo(() => {
    if (!summary || !atlasData?.cells?.length) {
      return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}° · ~50 km MERRA-2 grid cell`;
    }
    let nearest = null;
    let minDist = Infinity;
    let sumSlopes = 0;
    for (const c of atlasData.cells) {
      sumSlopes += c.sens_slope_per_decade ?? c.sen_slope_per_decade ?? 0;
      const d = haversineKm(latitude, longitude, c.latitude, c.longitude);
      if (d < minDist) {
        minDist = d;
        nearest = c;
      }
    }
    const globalMeanSlope = sumSlopes / atlasData.cells.length;
    const localDecade = summary.rate_per_decade ?? summary.sens_slope_per_year * 10;
    const diffGlobal = localDecade - globalMeanSlope;
    const nearestMean = nearest?.mean_value ?? nearest?.mean_climatology;
    const meanPart = nearestMean !== undefined && nearestMean !== null ? `Grid baseline ${nearestMean}${summary.unit}` : '';
    return `${formatSigned(diffGlobal, 2)} ${summary.unit}/dec vs global mean (${formatSigned(globalMeanSlope, 2)})${meanPart ? ` · ${meanPart}` : ''}`;
  }, [summary, atlasData, latitude, longitude]);

  // Semantic direction wording for WHAT card
  const whatDirection = useMemo(() => {
    if (!summary) return { word: 'Awaiting run', color: colors.muted };
    const slope = summary.sens_slope_per_year ?? 0;
    const isTemp = summary.variable === 'T2M';
    if (!summary.is_significant) {
      return {
        word: slope > 0 ? 'Slight rise (non-sig.)' : slope < 0 ? 'Slight fall (non-sig.)' : 'No clear trend',
        color: colors.muted
      };
    }
    if (slope > 0) {
      return { word: isTemp ? 'Warming' : 'Increasing', color: colors.warm };
    }
    return { word: isTemp ? 'Cooling' : 'Decreasing', color: colors.cool };
  }, [summary, colors]);

  const effectivePValue =
    summary?.autocorrelation?.is_significant && summary?.autocorrelation?.adjusted_mk_p_value !== undefined
      ? summary.autocorrelation.adjusted_mk_p_value
      : summary?.mann_kendall?.p_value;

  const isAutoAdjusted = Boolean(
    summary?.autocorrelation?.is_significant &&
      summary?.autocorrelation?.adjusted_mk_p_value !== undefined &&
      summary?.autocorrelation?.adjusted_mk_p_value !== null
  );

  const significanceLabel = useMemo(() => {
    if (!summary) return '—';
    if (effectivePValue !== undefined && effectivePValue >= 0.05 && effectivePValue < 0.1) {
      return 'Inconclusive';
    }
    return summary.is_significant ? 'Yes' : 'No';
  }, [summary, effectivePValue]);

  const pdfUrl = getPdfReportUrl({
    latitude,
    longitude,
    location_name: locationName,
    variable: selectedVariable,
    start_date: `${startYear}-01-01`,
    end_date: `${endYear}-12-31`,
    frequency
  });

  const csvUrl = getCsvExportUrl({
    latitude,
    longitude,
    location_name: locationName,
    variable: selectedVariable,
    start_date: `${startYear}-01-01`,
    end_date: `${endYear}-12-31`,
    frequency
  });

  return (
    <div className="bg-[var(--bg)] text-[var(--text)] flex-1 lg:flex-none lg:h-[calc(100vh-56px)] lg:max-h-[calc(100vh-56px)] lg:overflow-hidden">
      <div className="h-full max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-[264px_minmax(0,1fr)_316px] xl:grid-cols-[292px_minmax(0,1fr)_340px] lg:grid-rows-[minmax(0,1fr)]">
        {/* LEFT RAIL: 3-Step Investigation Controls */}
        <aside
          aria-label="Investigation Parameters"
          className="bg-[var(--panel)] border-b lg:border-b-0 lg:border-r border-[var(--border)] flex flex-col min-h-0 lg:h-full lg:overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* STEP 1: Variable */}
            <section className="space-y-2.5" aria-labelledby="step-var-heading">
              <div className="flex items-center justify-between">
                <h2 id="step-var-heading" className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--card-subtle)] border border-[var(--border)] text-[var(--text)] font-mono text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <span>Variable</span>
                </h2>
                <span className="text-[10px] font-mono text-[var(--muted)]">{selectedVariable}</span>
              </div>

              <VariableSelector
                variables={variables}
                selectedVariable={selectedVariable}
                onSelectVariable={setSelectedVariable}
                compact={true}
              />
            </section>

            {/* STEP 2: Where */}
            <section className="space-y-2.5 pt-4 border-t border-[var(--border)]" aria-labelledby="step-where-heading">
              <div className="flex items-center justify-between">
                <h2 id="step-where-heading" className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--card-subtle)] border border-[var(--border)] text-[var(--text)] font-mono text-[11px] flex items-center justify-center">
                    2
                  </span>
                  <span>Where</span>
                </h2>
              </div>

              {/* Quick Benchmark Chips */}
              <div className="flex flex-wrap gap-1">
                {QUICK_PLACES.map((spot) => {
                  const isMatch = Math.abs(spot.lat - latitude) < 0.1 && Math.abs(spot.lon - longitude) < 0.1;
                  return (
                    <button
                      key={spot.name}
                      type="button"
                      onClick={() => handleMapLocationChange(spot.name, spot.lat, spot.lon)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
                        isMatch
                          ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)] font-semibold'
                          : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
                      }`}
                    >
                      {spot.name.split(',')[0]}
                    </button>
                  );
                })}
              </div>

              <LocationMiniMap
                latitude={latitude}
                longitude={longitude}
                locationName={locationName}
                onLocationChange={handleMapLocationChange}
                atlasCells={atlasData?.cells || []}
                activeVariable={selectedVariable}
              />
            </section>

            {/* STEP 3: When */}
            <section className="space-y-2.5 pt-4 border-t border-[var(--border)]" aria-labelledby="step-when-heading">
              <div className="flex items-center justify-between">
                <h2 id="step-when-heading" className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--card-subtle)] border border-[var(--border)] text-[var(--text)] font-mono text-[11px] flex items-center justify-center">
                    3
                  </span>
                  <span>When</span>
                </h2>
                <span className="text-[10px] font-mono text-[var(--muted)]">1981–2023</span>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-3 space-y-3">
                <RangeSlider
                  min={1981}
                  max={2023}
                  startValue={startYear}
                  endValue={endYear}
                  onChange={(s, e) => {
                    setStartYear(s);
                    setEndYear(e);
                  }}
                  label="Select start and end years"
                />

                <div className="flex items-center gap-1 p-0.5 rounded-[10px] bg-[var(--panel)] border border-[var(--border)]">
                  {['monthly', 'daily'].map((resOpt) => (
                    <button
                      key={resOpt}
                      type="button"
                      onClick={() => setFrequency(resOpt)}
                      aria-pressed={frequency === resOpt}
                      className={`flex-1 py-1 rounded-[8px] text-[11px] font-semibold capitalize transition-colors ${
                        frequency === resOpt
                          ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                          : 'text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      {resOpt}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sticky Primary Action Button */}
          <div className="sticky bottom-0 p-3.5 bg-[var(--panel)] border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => runAnalysis()}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-[12px] bg-[var(--accent)] text-[var(--accent-fg)] font-bold text-sm inline-flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Running analysis...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>Run analysis</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* CENTRE WORKBENCH: Header + Primary Chart + Seasonal Fingerprint */}
        <section
          aria-label="Analysis Workspace"
          className="flex flex-col min-h-0 lg:h-full lg:overflow-y-auto p-4 sm:p-5 space-y-4"
        >
          {/* Page Header & Tab Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div className="min-w-0">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
                Mission Control
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight truncate">
                Investigating / {activeVarMeta.short_name || activeVarMeta.name} ·{' '}
                <span className="text-[var(--accent)]">{locationName}</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Visualization tabs">
              {[
                { id: 'timeseries', label: 'Time series' },
                { id: 'seasonal', label: 'Seasonal' },
                { id: 'yearly', label: 'Yearly' },
                { id: 'anomaly', label: 'Anomaly' },
                { id: 'export', label: 'Export' }
              ].map((t) => (
                <Pill
                  key={t.id}
                  size="sm"
                  active={activeTab === t.id}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </Pill>
              ))}
            </div>
          </div>

          {/* Alerts: Demonstration / Ocean */}
          {summary?.is_demonstration && (
            <div
              className="p-3 rounded-[14px] border flex items-center gap-3 text-xs"
              style={{
                backgroundColor: 'var(--warn-soft)',
                borderColor: 'var(--warn)',
                color: 'var(--text)'
              }}
              role="alert"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: 'var(--warn)' }} aria-hidden="true" />
              <div>
                <strong className="font-bold">SAMPLE DATA — NOT NASA OBSERVATIONS:</strong> Live NASA POWER endpoint unreachable; showing calibrated fallback demonstration series.
              </div>
            </div>
          )}

          {summary?.is_ocean && (
            <div className="p-3 rounded-[14px] border border-[var(--border)] bg-[var(--card)] flex items-start gap-2.5 text-xs text-[var(--muted)]">
              <Info className="w-4 h-4 shrink-0 text-[var(--accent)] mt-0.5" aria-hidden="true" />
              <span>
                <strong className="text-[var(--text)]">Marine Grid Cell:</strong> Open ocean coordinates utilize NASA MERRA-2 atmospheric assimilation and CERES radiometry rather than land weather stations.
              </span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div
              className="p-4 rounded-[14px] border space-y-3 text-xs"
              style={{
                backgroundColor: 'var(--warm-soft)',
                borderColor: 'var(--warm)',
                color: 'var(--text)'
              }}
              role="alert"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--warm)' }} />
                <div>
                  <h3 className="font-bold text-sm">Unable to complete statistical run</h3>
                  <p className="text-[var(--muted)] mt-0.5">{error}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => runAnalysis()}
                  className="px-3 py-1.5 rounded-[10px] bg-[var(--accent)] text-[var(--accent-fg)] font-semibold inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry analysis</span>
                </button>
                <Link
                  to="/cases"
                  className="px-3 py-1.5 rounded-[10px] bg-[var(--panel)] border border-[var(--border)] text-[var(--text)] font-medium inline-flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Open offline Detective Cases</span>
                </Link>
              </div>
            </div>
          )}

          {/* Skeleton Loading State when no analysisResult yet */}
          {loading && !summary && (
            <div className="space-y-4 animate-pulse">
              <div className="h-80 rounded-[14px] bg-[var(--card)] border border-[var(--border)]" />
              <div className="h-44 rounded-[14px] bg-[var(--card)] border border-[var(--border)]" />
            </div>
          )}

          {/* Active Tab Panels */}
          {summary && (
            <div className="space-y-4">
              {activeTab === 'timeseries' && (
                <>
                  <TimeSeriesChart
                    data={timeSeriesData}
                    variableName={summary.variable_name}
                    unit={summary.unit}
                    pettitt={summary.pettitt}
                    headline={summary.headline}
                    slopeDirection={summary.sens_slope_per_year}
                    onDownloadCsv={() => {
                      window.location.href = csvUrl;
                    }}
                  />
                  <SeasonalFingerprint timeSeries={timeSeriesData} unit={summary.unit} />
                </>
              )}

              {activeTab === 'seasonal' && (
                <>
                  <SeasonalChart data={monthlyData} unit={summary.unit} />
                  <SeasonalFingerprint timeSeries={timeSeriesData} unit={summary.unit} />
                </>
              )}

              {activeTab === 'yearly' && <YearlyChart data={yearlyData} unit={summary.unit} />}

              {activeTab === 'anomaly' && (
                <>
                  <TimeSeriesChart
                    data={timeSeriesData}
                    variableName={summary.variable_name}
                    unit={summary.unit}
                    pettitt={summary.pettitt}
                    headline="Deseasonalized departures relative to multi-year monthly climatology baseline."
                    slopeDirection={summary.sens_slope_per_year}
                    forceAnomaly={true}
                    onDownloadCsv={() => {
                      window.location.href = csvUrl;
                    }}
                  />
                  <SeasonalFingerprint timeSeries={timeSeriesData} unit={summary.unit} />
                </>
              )}

              {activeTab === 'export' && (
                <div className="space-y-4">
                  {/* Report & Data Downloads */}
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-[14px] p-5 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text)]">Export &amp; Reproducibility</h3>
                      <p className="text-xs text-[var(--muted)]">
                        Download publication-grade PDF summaries, raw cleaned NASA time-series CSV, or share exact URL coordinates.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-[10px] bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-xs inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Download PDF Report</span>
                      </a>
                      <a
                        href={csvUrl}
                        className="px-4 py-2 rounded-[10px] bg-[var(--panel)] border border-[var(--border)] text-[var(--text)] font-semibold text-xs inline-flex items-center gap-1.5 hover:border-[var(--accent)]"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download CSV Data</span>
                      </a>
                      <button
                        type="button"
                        onClick={copyShareableLink}
                        className="px-4 py-2 rounded-[10px] bg-[var(--panel)] border border-[var(--border)] text-[var(--text)] font-semibold text-xs inline-flex items-center gap-1.5 hover:border-[var(--accent)]"
                      >
                        {copiedLink ? <Check className="w-4 h-4" style={{ color: 'var(--sig)' }} /> : <Share2 className="w-4 h-4" />}
                        <span>{copiedLink ? 'Link Copied' : 'Copy Shareable URL'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Full Diagnostic Statistics Table */}
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-[14px] p-5 space-y-4 text-xs">
                    <div className="flex items-center gap-2 font-bold text-[var(--text)] pb-2 border-b border-[var(--border)]">
                      <Activity className="w-4 h-4 text-[var(--accent)]" />
                      <span>Full Non-Parametric &amp; Parametric Diagnostics</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                      <div className="p-3 rounded-[10px] bg-[var(--panel)] border border-[var(--border)] space-y-1">
                        <div className="font-sans font-bold text-[var(--muted)]">OLS Regression</div>
                        <div>Slope: <strong>{formatSigned(summary.linear_regression?.slope_per_year, 4)} {summary.unit}/yr</strong></div>
                        <div>R²: <strong>{summary.linear_regression?.r_squared?.toFixed(4)}</strong></div>
                        <div>p-value: <strong>{summary.linear_regression?.p_value?.toFixed(5)}</strong></div>
                      </div>
                      <div className="p-3 rounded-[10px] bg-[var(--panel)] border border-[var(--border)] space-y-1">
                        <div className="font-sans font-bold text-[var(--muted)]">Mann-Kendall Test</div>
                        <div>Kendall τ: <strong>{summary.mann_kendall?.tau?.toFixed(4)}</strong></div>
                        <div>Z-score: <strong>{summary.mann_kendall?.z?.toFixed(3)}</strong></div>
                        <div>Obs: <strong>{summary.observation_count} ({100 - summary.missing_percentage}% valid)</strong></div>
                      </div>
                      <div className="p-3 rounded-[10px] bg-[var(--panel)] border border-[var(--border)] space-y-1">
                        <div className="font-sans font-bold text-[var(--muted)]">Autocorrelation &amp; Pettitt</div>
                        <div>Lag-1 r₁: <strong>{summary.autocorrelation?.lag1?.toFixed(4) ?? '—'}</strong></div>
                        <div>Adj. MK p: <strong>{summary.autocorrelation?.adjusted_mk_p_value?.toFixed(5) ?? '—'}</strong></div>
                        <div>Change-pt: <strong>{summary.pettitt?.change_point_year || 'None'}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* RIGHT PANEL: Four Core Verdict Cards + Ask EarthPulse */}
        <aside
          aria-label="Scientific Verdict"
          className="bg-[var(--panel)] border-t lg:border-t-0 lg:border-l border-[var(--border)] min-h-0 lg:h-full lg:overflow-y-auto p-4 space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Scientific Verdict
            </h2>
            {summary && (
              <span className="text-[11px] font-mono text-[var(--muted)]">
                {startYear}–{endYear}
              </span>
            )}
          </div>

          {summary ? (
            <div className="space-y-2.5">
              {/* 1. WHAT */}
              <VerdictCard
                questionTag="01 · WHAT"
                accentBarColor={whatDirection.color}
                badge={
                  <span className="text-[11px] font-mono text-[var(--muted)]">
                    τ = {summary.mann_kendall?.tau?.toFixed(3) ?? '0.000'}
                  </span>
                }
                headlineValue={
                  <span className="inline-flex items-center gap-2" style={{ color: whatDirection.color }}>
                    <TrendArrow
                      value={summary.rate_per_decade}
                      unit={`${summary.unit}/dec`}
                      decimals={2}
                      isSignificant={summary.is_significant}
                      className="text-base"
                    />
                  </span>
                }
                detail={
                  <span>
                    <strong className="text-[var(--text)]">{whatDirection.word}</strong> in {activeVarMeta.short_name || activeVarMeta.name}.
                  </span>
                }
              />

              {/* 2. WHERE */}
              <VerdictCard
                questionTag="02 · WHERE"
                accentBarColor="var(--accent)"
                title={`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`}
                headlineValue={<span className="text-base font-sans font-bold">{locationName}</span>}
                detail={regionalComparisonText}
              />

              {/* 3. HOW MUCH */}
              <VerdictCard
                questionTag="03 · HOW MUCH"
                accentBarColor={summary.rate_per_decade >= 0 ? 'var(--warm)' : 'var(--cool)'}
                headlineValue={
                  <span
                    className="text-3xl font-extrabold tracking-tight font-mono"
                    style={{
                      color: !summary.is_significant
                        ? 'var(--text)'
                        : summary.rate_per_decade >= 0
                        ? 'var(--warm)'
                        : 'var(--cool)'
                    }}
                  >
                    {formatSigned(summary.rate_per_decade, 2)}
                  </span>
                }
                unit={`${summary.unit} / decade`}
                detail={
                  <span>
                    Estimated total change over {endYear - startYear + 1} yrs:{' '}
                    <strong className="font-mono text-[var(--text)]">
                      {formatSigned(summary.total_change, 2)} {summary.unit}
                    </strong>
                  </span>
                }
              />

              {/* 4. SIGNIFICANT? */}
              <VerdictCard
                questionTag="04 · SIGNIFICANT?"
                accentBarColor={summary.is_significant ? 'var(--sig)' : 'var(--border)'}
                badge={
                  <SignificanceBadge
                    isSignificant={summary.is_significant}
                    pValue={effectivePValue}
                    adjusted={isAutoAdjusted}
                    statusLabel={significanceLabel}
                  />
                }
                headlineValue={
                  <span
                    className="text-2xl font-extrabold tracking-tight"
                    style={{ color: summary.is_significant ? 'var(--sig)' : 'var(--muted)' }}
                  >
                    {significanceLabel}
                  </span>
                }
                detail={
                  <span className="font-mono text-[11px]">
                    p = {effectivePValue !== undefined ? effectivePValue.toFixed(5) : 'N/A'} · 95% confidence{' '}
                    {isAutoAdjusted ? '(autocorrelation-adjusted)' : '(standard MK)'}
                  </span>
                }
              />
            </div>
          ) : (
            <div className="space-y-2.5 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 rounded-[14px] bg-[var(--card)] border border-[var(--border)]" />
              ))}
            </div>
          )}

          {/* Ask EarthPulse AI Mini Chat */}
          <div className="pt-2">
            <AskEarthPulseSection currentAnalysis={summary} compact={true} />
          </div>
        </aside>
      </div>
    </div>
  );
}
