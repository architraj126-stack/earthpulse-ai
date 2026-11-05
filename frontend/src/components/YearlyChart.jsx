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
import { Calendar } from 'lucide-react';

const CustomYearlyTooltip = memo(({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    const mean = payload.find(p => p.dataKey === 'mean_value')?.value;
    const min = payload.find(p => p.dataKey === 'min_value')?.value;
    const max = payload.find(p => p.dataKey === 'max_value')?.value;

    return (
      <div className="bg-[#071426] border border-[#1E3A56] p-3 rounded-xl shadow-2xl text-xs space-y-1 z-50">
        <div className="font-bold text-white border-b border-[#1E3A56] pb-1 font-mono">
          Year: {label}
        </div>
        <div className="flex items-center justify-between gap-3 text-cyan-400">
          <span>Annual Mean:</span>
          <span className="font-mono font-bold">{mean} {unit}</span>
        </div>
        {min !== undefined && (
          <div className="flex items-center justify-between gap-3 text-blue-400">
            <span>Annual Min:</span>
            <span className="font-mono">{min} {unit}</span>
          </div>
        )}
        {max !== undefined && (
          <div className="flex items-center justify-between gap-3 text-amber-400">
            <span>Annual Max:</span>
            <span className="font-mono">{max} {unit}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
});

export default memo(function YearlyChart({ data = [], unit = '' }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-[#13263A] rounded-2xl border border-[#1E3A56] p-4 sm:p-5 shadow-xl space-y-3">
      <div className="pb-2 border-b border-[#1E3A56]">
        <h3 className="text-sm sm:text-base font-bold text-white font-heading flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#00D4FF]" />
          <span>Annual Mean Aggregates (Year-by-Year)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Displays inter-annual shifts with minimum, mean, and maximum annual ranges.
        </p>
      </div>

      <div className="h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E3A56" vertical={false} />
            <XAxis dataKey="year" stroke="#9BAEC2" fontSize={11} tickLine={{ stroke: '#1E3A56' }} />
            <YAxis stroke="#9BAEC2" fontSize={11} domain={['auto', 'auto']} unit={` ${unit}`} tickLine={{ stroke: '#1E3A56' }} />
            <Tooltip content={<CustomYearlyTooltip unit={unit} />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey="mean_value" name="Annual Mean" fill="#00D4FF" radius={[4, 4, 0, 0]} opacity={0.85} isAnimationActive={false} />
            <Line type="monotone" dataKey="max_value" name="Annual Peak" stroke="#F59E0B" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="min_value" name="Annual Minimum" stroke="#3B82F6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
