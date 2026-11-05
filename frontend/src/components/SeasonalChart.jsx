import React, { memo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Sun } from 'lucide-react';

const CustomSeasonalTooltip = memo(({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    const mean = payload.find(p => p.dataKey === 'mean_value')?.value;
    const std = payload.find(p => p.dataKey === 'std_dev')?.value;

    return (
      <div className="bg-[#071426] border border-[#1E3A56] p-3 rounded-xl shadow-2xl text-xs space-y-1 z-50">
        <div className="font-bold text-white border-b border-[#1E3A56] pb-1">
          Month: {label}
        </div>
        <div className="flex items-center justify-between gap-3 text-cyan-400">
          <span>Climatological Mean:</span>
          <span className="font-mono font-bold">{mean} {unit}</span>
        </div>
        {std !== undefined && (
          <div className="flex items-center justify-between gap-3 text-slate-400">
            <span>Std Deviation (σ):</span>
            <span className="font-mono">±{std} {unit}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
});

export default memo(function SeasonalChart({ data = [], unit = '' }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-[#13263A] rounded-2xl border border-[#1E3A56] p-4 sm:p-5 shadow-xl space-y-3">
      <div className="pb-2 border-b border-[#1E3A56]">
        <h3 className="text-sm sm:text-base font-bold text-white font-heading flex items-center gap-2">
          <Sun className="w-4 h-4 text-[#35D07F]" />
          <span>Monthly Seasonal Climatology (Jan–Dec Cycle)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Isolates the annual intra-seasonal cycle and natural monthly variance over the multi-year record.
        </p>
      </div>

      <div className="h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E3A56" vertical={false} />
            <XAxis dataKey="month_name" stroke="#9BAEC2" fontSize={11} tickLine={{ stroke: '#1E3A56' }} />
            <YAxis stroke="#9BAEC2" fontSize={11} domain={['auto', 'auto']} unit={` ${unit}`} tickLine={{ stroke: '#1E3A56' }} />
            <Tooltip content={<CustomSeasonalTooltip unit={unit} />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey="mean_value" name="Climatological Mean" fill="#35D07F" radius={[4, 4, 0, 0]} opacity={0.8} isAnimationActive={false} />
            <Line type="monotone" dataKey="std_dev" name="Interannual Variance (σ)" stroke="#00D4FF" strokeWidth={1.5} dot={true} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
