import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Download, TrendingUp, Info } from 'lucide-react';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    const obsVal = payload.find(p => p.dataKey === 'value')?.value;
    const trendVal = payload.find(p => p.dataKey === 'trend_value')?.value;

    return (
      <div className="bg-[#071426]/95 backdrop-blur-md border border-[#1E3A56] p-3 rounded-xl shadow-2xl text-xs space-y-1 z-50">
        <div className="font-semibold text-white border-b border-[#1E3A56] pb-1 font-mono">
          {label}
        </div>
        {obsVal !== undefined && obsVal !== null ? (
          <div className="flex items-center justify-between gap-3 text-cyan-400">
            <span>Observed Value:</span>
            <span className="font-mono font-bold">{obsVal} {unit}</span>
          </div>
        ) : (
          <div className="text-[#9BAEC2] italic">Missing Observation</div>
        )}
        {trendVal !== undefined && trendVal !== null && (
          <div className="flex items-center justify-between gap-3 text-emerald-400">
            <span>Linear Trendline:</span>
            <span className="font-mono font-semibold">{trendVal} {unit}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function TimeSeriesChart({
  data = [],
  variableName = 'Variable',
  unit = '',
  onDownloadCsv
}) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#13263A] rounded-xl border border-[#1E3A56] p-8 text-center text-[#9BAEC2] flex flex-col items-center justify-center h-80">
        <TrendingUp className="w-12 h-12 text-[#1E3A56] mb-3 animate-pulse" />
        <p className="text-sm">No time-series data available. Select a location and run trend analysis.</p>
      </div>
    );
  }

  // Format tick labels on X-axis (every few entries)
  const formatXAxis = (tickItem) => {
    if (!tickItem) return '';
    return tickItem.slice(0, 7); // 'YYYY-MM'
  };

  return (
    <div className="bg-[#13263A] rounded-xl border border-[#1E3A56] p-4 sm:p-5 shadow-lg space-y-3">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[#1E3A56]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span>Historical Time-Series & Linear Regression Trendline</span>
          </h3>
          <p className="text-xs text-[#9BAEC2]">
            Blue points represent observed NASA measurements; green line denotes calculated linear rate of change.
          </p>
        </div>

        {onDownloadCsv && (
          <button
            onClick={onDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1B2A] hover:bg-[#1E3A56] text-xs text-[#00D4FF] border border-[#1E3A56] transition active:scale-95 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Recharts Container */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
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
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
            />
            {/* Actual Observed Observations */}
            <Line
              type="monotone"
              dataKey="value"
              name={`Observed ${variableName}`}
              stroke="#00D4FF"
              strokeWidth={1.8}
              dot={false}
              activeDot={{ r: 5, fill: '#00D4FF', stroke: '#FFFFFF', strokeWidth: 2 }}
              connectNulls={false}
            />
            {/* Linear Regression Trendline */}
            <Line
              type="linear"
              dataKey="trend_value"
              name="Calculated Linear Trend"
              stroke="#35D07F"
              strokeWidth={2.2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
              connectNulls={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
