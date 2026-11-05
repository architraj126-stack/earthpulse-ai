import React, { memo, useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Download, TrendingUp, Sliders, Eye, EyeOff, Flag } from 'lucide-react';
import { downsampleLTTB } from '../utils/lttb';

const CustomTooltip = memo(({ active, payload, label, unit, isAnomalyMode }) => {
  if (active && payload && payload.length) {
    const obsVal = payload.find(p => p.dataKey === 'display_value')?.value;
    const trendVal = payload.find(p => p.dataKey === 'trend_value')?.value;
    const ciUpper = payload.find(p => p.dataKey === 'ci_upper')?.value;
    const ciLower = payload.find(p => p.dataKey === 'ci_lower')?.value;

    return (
      <div className="bg-[#071426] border border-[#1E3A56] p-3 rounded-xl shadow-2xl text-xs space-y-1.5 z-50">
        <div className="font-semibold text-white border-b border-[#1E3A56] pb-1 font-mono">
          {label}
        </div>
        {obsVal !== undefined && obsVal !== null ? (
          <div className="flex items-center justify-between gap-4 text-[#00D4FF]">
            <span>{isAnomalyMode ? 'Monthly Anomaly:' : 'Observation:'}</span>
            <span className="font-mono font-bold">{obsVal} {unit}</span>
          </div>
        ) : (
          <div className="text-slate-400 italic">No observation</div>
        )}
        {trendVal !== undefined && trendVal !== null && !isAnomalyMode && (
          <div className="flex items-center justify-between gap-4 text-[#35D07F]">
            <span>Calculated Trend:</span>
            <span className="font-mono font-semibold">{trendVal} {unit}</span>
          </div>
        )}
        {ciLower !== undefined && ciUpper !== undefined && (
          <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px]">
            <span>95% Confidence Interval:</span>
            <span className="font-mono">[{ciLower}, {ciUpper}]</span>
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
  onDownloadCsv
}) {
  const [removeSeasonality, setRemoveSeasonality] = useState(false);
  const [yearWindowStart, setYearWindowStart] = useState(null);

  // Compute available min and max years
  const { minYear, maxYear } = useMemo(() => {
    if (!data || data.length === 0) return { minYear: 1990, maxYear: 2023 };
    const firstYear = parseInt(data[0].date?.slice(0, 4) || '1990', 10);
    const lastYear = parseInt(data[data.length - 1].date?.slice(0, 4) || '2023', 10);
    return { minYear: firstYear, maxYear: lastYear };
  }, [data]);

  const activeStartYear = yearWindowStart !== null ? yearWindowStart : minYear;

  // Filter window + prepare plotted fields
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    let filtered = data;
    if (activeStartYear > minYear) {
      filtered = data.filter((d) => {
        const y = parseInt(d.date?.slice(0, 4) || '0', 10);
        return y >= activeStartYear;
      });
    }

    // Assign display_value based on anomaly toggle
    const mapped = filtered.map((d) => ({
      ...d,
      display_value: removeSeasonality ? (d.anomaly_value ?? d.value) : d.value
    }));

    // Downsample if over 1000 points to keep 60fps rendering
    if (mapped.length > 1000) {
      return downsampleLTTB(mapped, 1000);
    }
    return mapped;
  }, [data, activeStartYear, minYear, removeSeasonality]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#13263A] rounded-2xl border border-[#1E3A56] p-8 text-center text-slate-400 flex flex-col items-center justify-center h-80">
        <TrendingUp className="w-12 h-12 text-[#1E3A56] mb-3 animate-pulse" />
        <p className="text-sm">No time-series data available. Select a location and run trend analysis.</p>
      </div>
    );
  }

  const formatXAxis = (tickItem) => {
    if (!tickItem) return '';
    return tickItem.slice(0, 7);
  };

  return (
    <div className="bg-[#13263A] rounded-2xl border border-[#1E3A56] p-4 sm:p-5 shadow-xl space-y-3">
      {/* Chart Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1E3A56]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white font-heading flex items-center gap-2">
            <span>{removeSeasonality ? 'Monthly Anomaly Time-Series (Deseasonalized)' : 'Historical Observations & 95% Confidence Interval'}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {removeSeasonality
              ? 'Seasonal cycle removed: showing deviations from multi-year monthly climatology baseline.'
              : 'Cyan curve indicates NASA observations; green dashed line denotes Sen’s slope; shaded band is 95% CI.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Remove Seasonal Cycle Toggle */}
          <button
            type="button"
            onClick={() => setRemoveSeasonality(!removeSeasonality)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              removeSeasonality
                ? 'bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]'
                : 'bg-[#0D1B2A] text-slate-300 border-[#1E3A56] hover:text-white hover:border-slate-500'
            }`}
            title="Toggle deseasonalized anomaly series"
          >
            {removeSeasonality ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{removeSeasonality ? 'Deseasonalized On' : 'Remove Seasonal Cycle'}</span>
          </button>

          {/* Export CSV */}
          {onDownloadCsv && (
            <button
              onClick={onDownloadCsv}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0D1B2A] hover:bg-[#1E3A56] text-xs text-[#00D4FF] border border-[#1E3A56] transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* "What if we had more years?" Interactive Window Slider */}
      {maxYear - minYear > 6 && (
        <div className="flex items-center space-x-3 bg-[#0D1B2A] px-3.5 py-2 rounded-xl border border-[#1E3A56] text-xs">
          <Sliders className="w-4 h-4 text-[#00D4FF] shrink-0" />
          <span className="text-slate-300 shrink-0 font-medium">What if we had more years?</span>
          <span className="text-slate-400 font-mono text-[11px] shrink-0">Start Year: {activeStartYear}</span>
          <input
            type="range"
            min={minYear}
            max={maxYear - 5}
            value={activeStartYear}
            onChange={(e) => setYearWindowStart(parseInt(e.target.value, 10))}
            className="flex-1 accent-[#00D4FF] h-1.5 bg-[#13263A] rounded-lg cursor-pointer"
          />
          {activeStartYear !== minYear && (
            <button
              type="button"
              onClick={() => setYearWindowStart(minYear)}
              className="text-[11px] text-[#00D4FF] hover:underline shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Main Chart */}
      <div className="h-80 sm:h-96 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={processedData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E3A56" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#9BAEC2"
              fontSize={11}
              tickFormatter={formatXAxis}
              minTickGap={45}
              tickLine={{ stroke: '#1E3A56' }}
            />
            <YAxis
              stroke="#9BAEC2"
              fontSize={11}
              domain={['auto', 'auto']}
              unit={` ${unit}`}
              tickLine={{ stroke: '#1E3A56' }}
            />
            <Tooltip content={<CustomTooltip unit={unit} isAnomalyMode={removeSeasonality} />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />

            {/* Zero line in anomaly mode */}
            {removeSeasonality && (
              <ReferenceLine y={0} stroke="#9BAEC2" strokeDasharray="2 2" strokeWidth={1.2} />
            )}

            {/* Pettitt Change-Point Marker */}
            {pettitt?.change_point_date && (
              <ReferenceLine
                x={pettitt.change_point_date}
                stroke="#F59E0B"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                label={{
                  value: `Change-Point (${pettitt.change_point_year})`,
                  fill: '#F59E0B',
                  fontSize: 10,
                  position: 'insideTopLeft'
                }}
              />
            )}

            {/* 95% Confidence Interval Band (Lower and Upper bounds) */}
            {!removeSeasonality && (
              <>
                <Line
                  type="monotone"
                  dataKey="ci_upper"
                  name="95% CI Upper"
                  stroke="rgba(0, 212, 255, 0.3)"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="ci_lower"
                  name="95% CI Lower"
                  stroke="rgba(0, 212, 255, 0.3)"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            )}

            {/* Observations Line */}
            <Line
              type="monotone"
              dataKey="display_value"
              name={removeSeasonality ? `Anomaly (${unit})` : `Observed ${variableName}`}
              stroke="#00D4FF"
              strokeWidth={1.8}
              dot={false}
              activeDot={{ r: 4, fill: '#00D4FF', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              connectNulls={false}
              isAnimationActive={false}
            />

            {/* Linear Trendline */}
            {!removeSeasonality && (
              <Line
                type="linear"
                dataKey="trend_value"
                name="Calculated Trend"
                stroke="#35D07F"
                strokeWidth={2.2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
                connectNulls={true}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Change Point Info Callout if significant */}
      {pettitt?.is_significant && (
        <div className="flex items-center space-x-2 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 p-2.5 rounded-xl">
          <Flag className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <b>Pettitt Change-Point Detected:</b> A statistically significant shift in central tendency occurred around <b>{pettitt.change_point_year}</b> (p = {pettitt.p_value}).
          </span>
        </div>
      )}
    </div>
  );
});
