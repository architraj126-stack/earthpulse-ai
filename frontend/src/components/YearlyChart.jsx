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
import { useTheme } from '../theme/ThemeContext';

const CustomYearlyTooltip = memo(({ active, payload, label, unit, colors }) => {
  if (active && payload && payload.length) {
    const mean = payload.find((p) => p.dataKey === 'mean_value')?.value;
    const min = payload.find((p) => p.dataKey === 'min_value')?.value;
    const max = payload.find((p) => p.dataKey === 'max_value')?.value;

    return (
      <div className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-[12px] text-xs space-y-1 z-50">
        <div className="font-bold text-[var(--text)] border-b border-[var(--border)] pb-1 font-mono">
          Year: {label}
        </div>
        <div className="flex items-center justify-between gap-3" style={{ color: colors.accent }}>
          <span>Annual Mean:</span>
          <span className="font-mono font-bold">{mean} {unit}</span>
        </div>
        {min !== undefined && (
          <div className="flex items-center justify-between gap-3" style={{ color: colors.cool }}>
            <span>Annual Min:</span>
            <span className="font-mono">{min} {unit}</span>
          </div>
        )}
        {max !== undefined && (
          <div className="flex items-center justify-between gap-3" style={{ color: colors.warm }}>
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
  const { colors } = useTheme();
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-[var(--card)] rounded-[14px] border border-[var(--border)] p-4 sm:p-5 space-y-3">
      <div className="pb-2 border-b border-[var(--border)]">
        <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
          <span>Annual Mean Aggregates (Year-by-Year)</span>
        </h3>
        <p className="text-xs text-[var(--muted)]">
          Inter-annual shifts showing yearly mean bars bounded by minimum and maximum envelopes.
        </p>
      </div>

      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="year"
              stroke={colors.muted}
              fontSize={11}
              tickLine={{ stroke: colors.border }}
              axisLine={{ stroke: colors.border }}
            />
            <YAxis
              stroke={colors.muted}
              fontSize={11}
              domain={['auto', 'auto']}
              unit={` ${unit}`}
              tickLine={{ stroke: colors.border }}
              axisLine={{ stroke: colors.border }}
            />
            <Tooltip content={<CustomYearlyTooltip unit={unit} colors={colors} />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: colors.muted }} />
            <Bar
              dataKey="mean_value"
              name="Annual Mean"
              fill={colors.accent}
              radius={[4, 4, 0, 0]}
              opacity={0.85}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="max_value"
              name="Annual Peak"
              stroke={colors.warm}
              strokeWidth={1.6}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="min_value"
              name="Annual Minimum"
              stroke={colors.cool}
              strokeWidth={1.6}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
