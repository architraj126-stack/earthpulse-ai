import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Info,
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function MetricCard({ summary }) {
  if (!summary) return null;

  const {
    variable,
    variable_name,
    unit,
    location_name,
    start_date,
    end_date,
    frequency,
    observation_count,
    missing_percentage,
    linear_regression,
    mann_kendall,
    seasonal_mann_kendall,
    sens_slope_per_year,
    is_significant,
    trend_direction,
    status_color,
    source,
    is_demonstration
  } = summary;

  // Determine Badge Styling
  const badgeColors = {
    green: {
      bg: 'bg-[#35D07F]/15 border-[#35D07F]/40 text-[#35D07F]',
      badge: 'bg-[#35D07F] text-[#071426]',
      icon: TrendingUp,
      title: 'Statistically Significant Increase',
      pulse: 'shadow-[0_0_20px_rgba(53,208,127,0.25)]'
    },
    red: {
      bg: 'bg-[#FF4D4D]/15 border-[#FF4D4D]/40 text-[#FF4D4D]',
      badge: 'bg-[#FF4D4D] text-white',
      icon: TrendingDown,
      title: 'Statistically Significant Decrease',
      pulse: 'shadow-[0_0_20px_rgba(255,77,77,0.25)]'
    },
    grey: {
      bg: 'bg-[#9BAEC2]/10 border-[#9BAEC2]/30 text-[#9BAEC2]',
      badge: 'bg-[#9BAEC2]/30 text-[#9BAEC2]',
      icon: Minus,
      title: 'No Statistically Significant Trend',
      pulse: ''
    }
  };

  const statusConfig = badgeColors[status_color] || badgeColors.grey;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-4">
      
      {/* Demonstration Data Banner if NASA API is down */}
      {is_demonstration && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold uppercase tracking-wider block text-amber-300">
              Demonstration Dataset Mode
            </span>
            <span>
              Live NASA POWER endpoint was not reachable from sandbox environment. The system generated a physically faithful, labeled demonstration dataset matching latitude, solar cycles, and historical trends for testing.
            </span>
          </div>
        </div>
      )}

      {/* Main Status Headline Banner */}
      <div className={`rounded-xl border p-4 sm:p-5 transition-all ${statusConfig.bg} ${statusConfig.pulse}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#071426]/70 border border-current">
              <StatusIcon className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${statusConfig.badge}`}>
                  {is_significant ? `${trend_direction.toUpperCase()} TREND` : 'NO MONOTONIC TREND'}
                </span>
                <span className="text-xs text-white/80 font-mono">
                  p = {mann_kendall.p_value}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                {statusConfig.title}
              </h3>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-white/70">Sen's Slope Annual Rate:</div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {sens_slope_per_year > 0 ? `+${sens_slope_per_year}` : sens_slope_per_year}{' '}
              <span className="text-sm font-normal text-white/80">{unit}/yr</span>
            </div>
            <div className="text-[11px] text-white/60">
              ({sens_slope_per_year * 10 > 0 ? `+${(sens_slope_per_year * 10).toFixed(3)}` : (sens_slope_per_year * 10).toFixed(3)} {unit}/decade)
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Statistical Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Sen's Slope */}
        <div className="bg-[#13263A] border border-[#1E3A56] rounded-xl p-3.5 shadow-md">
          <div className="text-[11px] text-[#9BAEC2] flex items-center justify-between mb-1">
            <span>Sen's Slope Estimator</span>
            <span className="text-[#00D4FF] font-mono text-[10px]">Non-parametric</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {sens_slope_per_year > 0 ? `+${sens_slope_per_year}` : sens_slope_per_year}
          </div>
          <p className="text-[10px] text-[#9BAEC2] mt-1">
            Median pairwise slope; robust against outliers and gaps.
          </p>
        </div>

        {/* Card 2: Mann-Kendall P-Value */}
        <div className="bg-[#13263A] border border-[#1E3A56] rounded-xl p-3.5 shadow-md">
          <div className="text-[11px] text-[#9BAEC2] flex items-center justify-between mb-1">
            <span>Mann-Kendall P-Value</span>
            <span className="font-mono text-[10px] text-emerald-400">α = 0.05</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {mann_kendall.p_value}
          </div>
          <p className="text-[10px] text-[#9BAEC2] mt-1">
            {is_significant ? 'Statistically significant (p < 0.05)' : 'Not significant (p ≥ 0.05)'}
          </p>
        </div>

        {/* Card 3: Linear Regression Slope & R² */}
        <div className="bg-[#13263A] border border-[#1E3A56] rounded-xl p-3.5 shadow-md">
          <div className="text-[11px] text-[#9BAEC2] flex items-center justify-between mb-1">
            <span>OLS Regression</span>
            <span className="text-[#00D4FF] font-mono text-[10px]">R² = {linear_regression.r_squared}</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {linear_regression.slope_per_year > 0 ? `+${linear_regression.slope_per_year}` : linear_regression.slope_per_year}
          </div>
          <p className="text-[10px] text-[#9BAEC2] mt-1">
            Std Err: ±{linear_regression.std_err} {unit}
          </p>
        </div>

        {/* Card 4: Observations & Quality */}
        <div className="bg-[#13263A] border border-[#1E3A56] rounded-xl p-3.5 shadow-md">
          <div className="text-[11px] text-[#9BAEC2] flex items-center justify-between mb-1">
            <span>Data Observations</span>
            <span className="text-[#35D07F] font-mono text-[10px]">{100 - missing_percentage}% Valid</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {observation_count} <span className="text-xs text-[#9BAEC2] font-normal">points</span>
          </div>
          <p className="text-[10px] text-[#9BAEC2] mt-1">
            Missing: {missing_percentage}% of record
          </p>
        </div>

      </div>

      {/* Advanced Statistical Metrics Table */}
      <div className="bg-[#13263A] rounded-xl border border-[#1E3A56] p-4 text-xs space-y-2">
        <h4 className="font-semibold text-white flex items-center gap-1.5 pb-2 border-b border-[#1E3A56]">
          <Activity className="w-4 h-4 text-[#00D4FF]" />
          <span>Advanced Test Metrics</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <span className="text-[#9BAEC2] block text-[10px]">Kendall's Tau (τ):</span>
            <span className="font-mono font-bold text-white text-sm">{mann_kendall.tau}</span>
          </div>
          <div>
            <span className="text-[#9BAEC2] block text-[10px]">MK Z-Statistic:</span>
            <span className="font-mono font-bold text-white text-sm">{mann_kendall.z}</span>
          </div>
          <div>
            <span className="text-[#9BAEC2] block text-[10px]">95% CI for Slope:</span>
            <span className="font-mono font-bold text-white text-xs truncate block">
              [{linear_regression.ci_95_lower}, {linear_regression.ci_95_upper}]
            </span>
          </div>
          <div>
            <span className="text-[#9BAEC2] block text-[10px]">Seasonal MK (m=12):</span>
            <span className="font-mono font-bold text-white text-xs">
              {seasonal_mann_kendall ? `p = ${seasonal_mann_kendall.p_value}` : 'N/A (Daily/Short)'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
