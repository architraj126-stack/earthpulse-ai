import React, { memo, useState, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { Download, TrendingUp, Sliders, Flag, Image as ImageIcon } from 'lucide-react';
import { downsampleLTTB } from '../utils/lttb';
import { useTheme } from '../theme/ThemeContext';

const CustomTooltip = memo(({ active, payload, label, unit, isAnomalyMode, colors }) => {
  if (active && payload && payload.length) {
    const obsVal = payload.find((p) => p.dataKey === 'display_value')?.value;
    const rollingVal = payload.find((p) => p.dataKey === 'rolling_mean_12m')?.value;
    const trendVal = payload.find((p) => p.dataKey === 'trend_value')?.value;
    const rawPt = payload[0]?.payload;

    return (
      <div
        className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-[12px] text-xs space-y-1.5 z-50"
        style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)' }}
      >
        <div className="font-semibold text-[var(--text)] border-b border-[var(--border)] pb-1 font-mono">
          {label}
        </div>
        {obsVal !== undefined && obsVal !== null ? (
          <div className="flex items-center justify-between gap-4 text-[var(--text)]">
            <span className="text-[var(--muted)]">{isAnomalyMode ? 'Monthly anomaly:' : 'Observed:'}</span>
            <span className="font-mono font-semibold">{obsVal} {unit}</span>
          </div>
        ) : (
          <div className="text-[var(--muted)] italic">No observation</div>
        )}
        {rollingVal !== undefined && rollingVal !== null && !isAnomalyMode && (
          <div className="flex items-center justify-between gap-4" style={{ color: colors.rolling }}>
            <span>12-mo rolling mean:</span>
            <span className="font-mono font-bold">{rollingVal} {unit}</span>
          </div>
        )}
        {trendVal !== undefined && trendVal !== null && !isAnomalyMode && (
          <div className="flex items-center justify-between gap-4" style={{ color: colors.accent }}>
            <span>Sen&apos;s trend fit:</span>
            <span className="font-mono font-semibold">{trendVal} {unit}</span>
          </div>
        )}
        {rawPt?.ci_lower !== undefined && rawPt?.ci_upper !== undefined && rawPt?.ci_lower !== null && (
          <div className="flex items-center justify-between gap-4 text-[var(--muted)] text-[11px]">
            <span>95% CI:</span>
            <span className="font-mono">[{rawPt.ci_lower}, {rawPt.ci_upper}]</span>
          </div>
        )}
      </div>
    );
  }
  return null;
});

export default memo(function TimeSeriesChart({
  data = [],
  variableName = 'Variable',
  unit = '',
  pettitt = null,
  headline = '',
  slopeDirection = 1,
  forceAnomaly = false,
  onDownloadCsv,
  compact = false
}) {
  const { colors } = useTheme();
  const [removeSeasonality, setRemoveSeasonality] = useState(false);
  const [yearWindowStart, setYearWindowStart] = useState(null);
  const chartContainerRef = useRef(null);

  const isAnomalyMode = forceAnomaly || removeSeasonality;

  const { minYear, maxYear } = useMemo(() => {
    if (!data || data.length === 0) return { minYear: 1990, maxYear: 2023 };
    const firstYear = parseInt(data[0].date?.slice(0, 4) || '1990', 10);
    const lastYear = parseInt(data[data.length - 1].date?.slice(0, 4) || '2023', 10);
    return { minYear: firstYear, maxYear: lastYear };
  }, [data]);

  const activeStartYear = yearWindowStart !== null ? yearWindowStart : minYear;

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let filtered = data;
    if (activeStartYear > minYear) {
      filtered = data.filter((d) => {
        const y = parseInt(d.date?.slice(0, 4) || '0', 10);
        return y >= activeStartYear;
      });
    }

    const windowVals = [];
    const withRolling = filtered.map((d) => {
      const v = isAnomalyMode ? (d.anomaly_value ?? d.value) : d.value;
      if (v !== null && v !== undefined && !Number.isNaN(v)) {
        windowVals.push(v);
        if (windowVals.length > 12) windowVals.shift();
      }
      const rollingMean =
        windowVals.length >= 6
          ? Math.round((windowVals.reduce((a, b) => a + b, 0) / windowVals.length) * 100) / 100
          : null;

      const hasCi =
        d.ci_lower !== null &&
        d.ci_lower !== undefined &&
        d.ci_upper !== null &&
        d.ci_upper !== undefined;

      return {
        ...d,
        display_value: v,
        rolling_mean_12m: rollingMean,
        ci_band: hasCi ? [d.ci_lower, d.ci_upper] : null
      };
    });

    if (withRolling.length > 1000) {
      return downsampleLTTB(withRolling, 1000);
    }
    return withRolling;
  }, [data, activeStartYear, minYear, isAnomalyMode]);

  const trendStroke = slopeDirection >= 0 ? colors.warm : colors.cool;

  const handleDownloadPng = () => {
    if (!chartContainerRef.current) return;
    const chartSvg = chartContainerRef.current.querySelector('svg');
    if (!chartSvg) return;

    try {
      const svgData = new XMLSerializer().serializeToString(chartSvg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URLObj = window.URL || window.webkitURL || window;
      const blobURL = URLObj.createObjectURL(svgBlob);

      img.onload = () => {
        const width = chartSvg.clientWidth * 2 || 1600;
        const height = chartSvg.clientHeight * 2 || 800;
        canvas.width = width;
        canvas.height = height;

        ctx.fillStyle = colors.card || '#1e2318';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = colors.muted || '#a7a28d';
        ctx.fillText(`EarthPulse AI · ${variableName} (${unit})`, 36, height - 24);

        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `earthpulse_${variableName.toLowerCase().replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URLObj.revokeObjectURL(blobURL);
      };
      img.src = blobURL;
    } catch {
      window.print();
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--card)] rounded-[14px] border border-[var(--border)] p-8 text-center text-[var(--muted)] flex flex-col items-center justify-center h-72">
        <TrendingUp className="w-10 h-10 mb-2 opacity-40" aria-hidden="true" />
        <p className="text-sm">No time-series observations available. Run an analysis to visualize records.</p>
      </div>
    );
  }

  const formatXAxis = (tickItem) => (tickItem ? tickItem.slice(0, 4) : '');

  return (
    <div
      ref={chartContainerRef}
      className="bg-[var(--card)] rounded-[14px] border border-[var(--border)] p-4 sm:p-5 space-y-3"
    >
      {/* Headline & Actions Toolbar */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div className="space-y-0.5 max-w-2xl">
          <h3 className="text-sm font-bold text-[var(--text)]">
            {isAnomalyMode ? 'Monthly Departures from Climatology (Anomaly)' : 'Observed Series & Non-Parametric Trend'}
          </h3>
          {headline && <p className="text-xs text-[var(--muted)] leading-relaxed">{headline}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {!forceAnomaly && (
            <button
              type="button"
              onClick={() => setRemoveSeasonality((prev) => !prev)}
              aria-pressed={removeSeasonality}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                removeSeasonality
                  ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)] font-semibold'
                  : 'bg-[var(--panel)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              {removeSeasonality ? 'Anomaly View' : 'Deseasonalize'}
            </button>
          )}
          <button
            type="button"
            onClick={handleDownloadPng}
            aria-label="Download chart as PNG image"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--panel)] border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>PNG</span>
          </button>
          {onDownloadCsv && (
            <button
              type="button"
              onClick={onDownloadCsv}
              aria-label="Export observations as CSV"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--panel)] border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Chart */}
      <div className={compact ? 'h-64 w-full' : 'h-72 sm:h-80 w-full'}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={processedData} margin={{ top: 14, right: 18, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="date"
              stroke={colors.muted}
              fontSize={11}
              tickFormatter={formatXAxis}
              minTickGap={42}
              tickLine={{ stroke: colors.border }}
              axisLine={{ stroke: colors.border }}
            />
            <YAxis
              stroke={colors.muted}
              fontSize={11}
              domain={['auto', 'auto']}
              width={52}
              tickFormatter={(val) => `${val}`}
              label={{
                value: unit,
                angle: -90,
                position: 'insideLeft',
                fill: colors.muted,
                fontSize: 11,
                dy: 10
              }}
              tickLine={{ stroke: colors.border }}
              axisLine={{ stroke: colors.border }}
            />
            <Tooltip
              content={<CustomTooltip unit={unit} isAnomalyMode={isAnomalyMode} colors={colors} />}
            />

            {isAnomalyMode && (
              <ReferenceLine y={0} stroke={colors.muted} strokeDasharray="2 2" strokeWidth={1} />
            )}

            {/* 95% Confidence Interval Shaded Band */}
            {!isAnomalyMode && (
              <Area
                type="monotone"
                dataKey="ci_band"
                name="95% CI Band"
                stroke="none"
                fill={colors.ciFill}
                isAnimationActive={false}
              />
            )}

            {/* Pettitt Change-Point Vertical Marker */}
            {pettitt?.change_point_date && (
              <ReferenceLine
                x={pettitt.change_point_date}
                stroke={colors.changepoint}
                strokeWidth={1.8}
                strokeDasharray="4 4"
                label={{
                  value: `Shift ${pettitt.change_point_year}`,
                  fill: colors.changepoint,
                  fontSize: 10,
                  fontWeight: 600,
                  position: 'insideTopRight'
                }}
              />
            )}

            {/* Monthly Observations (Thin, Muted) */}
            <Line
              type="monotone"
              dataKey="display_value"
              name={isAnomalyMode ? 'Monthly Anomaly' : 'Monthly Observations'}
              stroke={colors.obs}
              strokeWidth={1.15}
              dot={false}
              activeDot={{ r: 3.5, fill: colors.accent, stroke: colors.card, strokeWidth: 1.5 }}
              connectNulls={false}
              isAnimationActive={false}
            />

            {/* 12-Month Rolling Mean (Thick) */}
            {!isAnomalyMode && (
              <Line
                type="monotone"
                dataKey="rolling_mean_12m"
                name="12-Mo Rolling Mean"
                stroke={colors.rolling}
                strokeWidth={2.2}
                dot={false}
                activeDot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}

            {/* Sen's Slope Dashed Line */}
            {!isAnomalyMode && (
              <Line
                type="linear"
                dataKey="trend_value"
                name="Sen's Slope Trend"
                stroke={trendStroke}
                strokeWidth={2.2}
                strokeDasharray="6 4"
                dot={false}
                activeDot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Explicit Legend Row + Optional Quick Window Slider */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-[1.5px] inline-block" style={{ backgroundColor: colors.obs }} />
            <span>{isAnomalyMode ? 'Monthly Anomaly' : 'Monthly Obs'}</span>
          </span>
          {!isAnomalyMode && (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 h-[2.5px] inline-block" style={{ backgroundColor: colors.rolling }} />
                <span>12-mo Rolling Mean</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-4 h-0 border-t-2 border-dashed inline-block"
                  style={{ borderColor: trendStroke }}
                />
                <span>Sen&apos;s Trend</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3.5 h-2.5 rounded-[2px] inline-block" style={{ backgroundColor: colors.ciFill }} />
                <span>95% CI</span>
              </span>
            </>
          )}
          {pettitt?.change_point_year && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-mono text-[10px]"
              style={{
                borderColor: colors.changepoint,
                color: colors.changepoint,
                backgroundColor: 'rgba(214, 69, 93, 0.1)'
              }}
            >
              <Flag className="w-2.5 h-2.5" aria-hidden="true" />
              <span>Change-point {pettitt.change_point_year}</span>
            </span>
          )}
        </div>

        {maxYear - minYear > 6 && (
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <Sliders className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
            <span>From {activeStartYear}</span>
            <input
              type="range"
              min={minYear}
              max={maxYear - 5}
              value={activeStartYear}
              aria-label="Inspect sub-window start year"
              onChange={(e) => setYearWindowStart(parseInt(e.target.value, 10))}
              className="w-24 accent-[var(--accent)] cursor-pointer"
            />
            {activeStartYear !== minYear && (
              <button
                type="button"
                onClick={() => setYearWindowStart(minYear)}
                className="text-[var(--accent)] hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
