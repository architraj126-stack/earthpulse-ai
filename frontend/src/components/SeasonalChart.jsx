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
import { useTheme } from '../theme/ThemeContext';

const CustomSeasonalTooltip = memo(({ active, payload, label, unit, colors }) => {
  if (active && payload && payload.length) {
    const mean = payload.find((p) => p.dataKey === 'mean_value')?.value;
    const std = payload.find((p) => p.dataKey === 'std_dev')?.value;

    return (
      <div className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-[12px] text-xs space-y-1 z-50">
        <div className="font-bold text-[var(--text)] border-b border-[var(--border)] pb-1">
          Month: {label}
        </div>
        <div className="flex items-center justify-between gap-3" style={{ color: colors.cool }}>
          <span>Climatological Mean:</span>
          <span className="font-mono font-bold">{mean} {unit}</span>
        </div>
        {std !== undefined && (
          <div className="flex items-center justify-between gap-3 text-[var(--muted)]">
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
  const { colors } = useTheme();
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-[var(--card)] rounded-[14px] border border-[var(--border)] p-4 sm:p-5 space-y-3">
      <div className="pb-2 border-b border-[var(--border)]">
        <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
          <Sun className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
          <span>Monthly Seasonal Climatology (Jan–Dec Cycle)</span>
        </h3>
        <p className="text-xs text-[var(--muted)]">
          Isolates the intra-annual seasonal cycle and inter-year standard deviation across months.
        </p>
      </div>

      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="month_name"
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
            <Tooltip content={<CustomSeasonalTooltip unit={unit} colors={colors} />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: colors.muted }} />
            <Bar
              dataKey="mean_value"
              name="Climatological Mean"
              fill={colors.cool}
              radius={[4, 4, 0, 0]}
              opacity={0.85}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="std_dev"
              name="Interannual Variance (σ)"
              stroke={colors.warm}
              strokeWidth={1.8}
              dot={{ r: 2.5, fill: colors.warm }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
