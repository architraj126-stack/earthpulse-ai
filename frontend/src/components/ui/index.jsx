import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

/**
 * Interactive filter / navigation / tab Pill
 */
export function Pill({
  active = false,
  onClick,
  children,
  className = '',
  icon: Icon = null,
  ariaLabel,
  type = 'button',
  size = 'md'
}) {
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-[13px]';
  return (
    <button
      type={type}
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors whitespace-nowrap ${sizeClass} ${
        active
          ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)] font-semibold'
          : 'bg-[var(--panel)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--muted)]'
      } ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}

/**
 * Trend direction indicator strictly pairing color + arrow icon + explicit sign
 */
export function TrendArrow({
  value,
  unit = '',
  decimals = 2,
  isSignificant = true,
  showLabel = false,
  className = ''
}) {
  const num = Number(value ?? 0);
  const isPositive = num > 0.00001;
  const isNegative = num < -0.00001;

  const colorStyle = !isSignificant
    ? { color: 'var(--muted)' }
    : isPositive
    ? { color: 'var(--warm)' }
    : isNegative
    ? { color: 'var(--cool)' }
    : { color: 'var(--muted)' };

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const sign = isPositive ? '+' : '';
  const directionText = isPositive ? 'Increasing' : isNegative ? 'Decreasing' : 'Flat';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-semibold ${className}`}
      style={colorStyle}
      aria-label={`${directionText} ${sign}${num.toFixed(decimals)} ${unit}`}
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>
        {sign}
        {num.toFixed(decimals)}
        {unit ? ` ${unit}` : ''}
      </span>
      {showLabel && <span className="font-sans text-xs font-medium ml-0.5">({directionText})</span>}
    </span>
  );
}

/**
 * Statistical significance badge with color + icon + textual status
 */
export function SignificanceBadge({ isSignificant, pValue, adjusted = false, statusLabel = null }) {
  let label = statusLabel;
  let Icon = CheckCircle2;
  let style = {
    backgroundColor: 'var(--sig-soft)',
    color: 'var(--sig)',
    borderColor: 'var(--sig)'
  };

  if (statusLabel === 'Inconclusive' || (pValue !== undefined && pValue >= 0.05 && pValue < 0.1)) {
    label = label || 'Inconclusive';
    Icon = AlertCircle;
    style = {
      backgroundColor: 'var(--warn-soft)',
      color: 'var(--warn)',
      borderColor: 'var(--warn)'
    };
  } else if (!isSignificant) {
    label = label || 'No (p ≥ 0.05)';
    Icon = HelpCircle;
    style = {
      backgroundColor: 'var(--card-subtle)',
      color: 'var(--muted)',
      borderColor: 'var(--border)'
    };
  } else {
    label = label || 'Yes (95% sig.)';
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
      style={style}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
      {adjusted && <span className="font-mono text-[10px] opacity-80">· AC adj.</span>}
    </span>
  );
}

/**
 * Clean 14px-radius StatCard with heavy numeric emphasis
 */
export function StatCard({ label, value, unit = '', sublabel = '', accentColor = null, className = '' }) {
  return (
    <div
      className={`bg-[var(--card)] border border-[var(--border)] rounded-[14px] p-4 flex flex-col justify-between gap-1 ${className}`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</div>
      <div
        className="text-2xl font-extrabold font-mono tracking-tight leading-none py-1"
        style={accentColor ? { color: accentColor } : { color: 'var(--text)' }}
      >
        {value}
        {unit && <span className="text-xs font-medium text-[var(--muted)] ml-1">{unit}</span>}
      </div>
      {sublabel && <div className="text-xs text-[var(--muted)] font-mono truncate">{sublabel}</div>}
    </div>
  );
}

/**
 * VerdictCard used in Mission Control right rail (WHAT / WHERE / HOW MUCH / SIGNIFICANT?)
 */
export function VerdictCard({
  questionTag,
  title,
  headlineValue,
  unit = '',
  detail,
  accentBarColor = 'var(--border)',
  badge = null,
  className = ''
}) {
  return (
    <div
      className={`bg-[var(--card)] border border-[var(--border)] rounded-[14px] p-3.5 relative overflow-hidden ${className}`}
      style={{ borderLeftWidth: '3px', borderLeftColor: accentBarColor }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--muted)]">
          {questionTag}
        </span>
        {badge}
      </div>
      {title && <div className="text-xs font-medium text-[var(--muted)] mb-0.5">{title}</div>}
      {headlineValue !== undefined && headlineValue !== null && (
        <div className="text-xl font-extrabold font-mono tracking-tight text-[var(--text)] leading-tight">
          {headlineValue}
          {unit && <span className="text-xs font-normal text-[var(--muted)] ml-1">{unit}</span>}
        </div>
      )}
      {detail && <div className="text-xs text-[var(--muted)] mt-1 leading-relaxed">{detail}</div>}
    </div>
  );
}

/**
 * Floating semi-transparent glass panel for Global Atlas map overlays
 */
export function GlassPanel({ children, className = '' }) {
  return (
    <div
      className={`backdrop-blur-md border border-[var(--border)] rounded-[14px] ${className}`}
      style={{ backgroundColor: 'var(--glass)' }}
    >
      {children}
    </div>
  );
}

/**
 * Diverging color bar legend + optional non-significant diagonal hatch swatch
 */
export function DivergingLegend({
  minLabel = '-0.5',
  maxLabel = '+0.5',
  unitLabel = 'unit/decade',
  showHatch = true,
  className = ''
}) {
  return (
    <div className={`space-y-2 text-xs ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text)]">
        <span>Trend Scale</span>
        <span className="font-mono text-[var(--muted)]">{unitLabel}</span>
      </div>
      <div
        className="h-2.5 w-full rounded-full border border-[var(--border)]"
        style={{
          background: 'linear-gradient(to right, var(--cool), var(--neutral-cell), var(--warm))'
        }}
        aria-hidden="true"
      />
      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--muted)]">
        <span>{minLabel} (Cooling / −)</span>
        <span>0</span>
        <span>{maxLabel} (Warming / +)</span>
      </div>
      {showHatch && (
        <div className="flex items-center gap-2 pt-1.5 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
          <span
            className="w-4 h-3 rounded-[3px] border border-[var(--border)] shrink-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 2px, var(--muted) 2px, var(--muted) 3px)',
              opacity: 0.7
            }}
            aria-hidden="true"
          />
          <span>Diagonal hatch: Not significant (p ≥ 0.05)</span>
        </div>
      )}
    </div>
  );
}

/**
 * Accessible dual-handle year RangeSlider
 */
export function RangeSlider({
  min = 1981,
  max = 2023,
  startValue,
  endValue,
  onChange,
  minSpan = 5,
  label = 'Year range'
}) {
  const safeStart = Math.max(min, Math.min(startValue, endValue - minSpan));
  const safeEnd = Math.min(max, Math.max(endValue, safeStart + minSpan));

  const leftPct = ((safeStart - min) / (max - min)) * 100;
  const rightPct = ((safeEnd - min) / (max - min)) * 100;

  return (
    <div className="space-y-2" role="group" aria-label={label}>
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="font-semibold text-[var(--text)]">{safeStart}</span>
        <span className="text-[11px] text-[var(--muted)]">{safeEnd - safeStart + 1} yrs</span>
        <span className="font-semibold text-[var(--text)]">{safeEnd}</span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="w-full h-1.5 rounded-full bg-[var(--border)] relative">
          <div
            className="absolute top-0 h-1.5 rounded-full"
            style={{
              left: `${leftPct}%`,
              width: `${Math.max(2, rightPct - leftPct)}%`,
              backgroundColor: 'var(--accent)'
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={safeStart}
          aria-label="Start year"
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            onChange(Math.min(val, safeEnd - minSpan), safeEnd);
          }}
          className="terra-range-input absolute inset-0 w-full h-5 m-0"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={safeEnd}
          aria-label="End year"
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            onChange(safeStart, Math.max(val, safeStart + minSpan));
          }}
          className="terra-range-input absolute inset-0 w-full h-5 m-0"
        />
      </div>
    </div>
  );
}
