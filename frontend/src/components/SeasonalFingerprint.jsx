import React, { memo, useMemo, useState } from 'react';
import { Grid } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import {
  MONTH_NAMES,
  computeSeasonalFingerprint,
  getDivergingColor,
  formatSigned
} from '../utils/climateMath';

/**
 * Month x Year diverging anomaly grid ("Seasonal Fingerprint")
 */
export default memo(function SeasonalFingerprint({ timeSeries = [], unit = '' }) {
  const { colors } = useTheme();
  const [hoveredCell, setHoveredCell] = useState(null);

  const { years, grid, maxAbsAnomaly, fastestMonth } = useMemo(
    () => computeSeasonalFingerprint(timeSeries),
    [timeSeries]
  );

  if (!years.length) {
    return null;
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[14px] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-[var(--accent)] shrink-0" aria-hidden="true" />
          <h3 className="text-sm font-bold text-[var(--text)]">Seasonal Fingerprint (Month × Year Anomaly)</h3>
        </div>
        {hoveredCell ? (
          <div className="text-xs font-mono text-[var(--text)] bg-[var(--card-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--border)]">
            {MONTH_NAMES[hoveredCell.month]} {hoveredCell.year}:{' '}
            <span className="font-bold">{formatSigned(hoveredCell.val, 2)} {unit}</span>
          </div>
        ) : (
          <span className="text-[11px] font-mono text-[var(--muted)]">
            {years[0]}–{years[years.length - 1]} ({years.length} yrs)
          </span>
        )}
      </div>

      {/* Heatmap Matrix: Rows = 12 Months, Columns = Years */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[520px] space-y-1">
          {/* Year Axis Top Ticks */}
          <div className="flex items-center pl-9 text-[10px] font-mono text-[var(--muted)] justify-between">
            <span>{years[0]}</span>
            {years.length > 4 && <span>{years[Math.floor(years.length / 2)]}</span>}
            <span>{years[years.length - 1]}</span>
          </div>

          {MONTH_NAMES.map((mName, mIdx) => (
            <div key={mName} className="flex items-center gap-1.5">
              <span className="w-7 text-[10px] font-mono text-[var(--muted)] text-right shrink-0">
                {mName}
              </span>
              <div
                className="flex-1 grid gap-[2px]"
                style={{ gridTemplateColumns: `repeat(${years.length}, minmax(6px, 1fr))` }}
              >
                {years.map((yr) => {
                  const val = grid[yr]?.[mIdx];
                  const hasVal = val !== undefined && val !== null;
                  const bg = hasVal
                    ? getDivergingColor(val, maxAbsAnomaly, colors)
                    : 'var(--card-subtle)';
                  return (
                    <button
                      key={`${yr}-${mIdx}`}
                      type="button"
                      onMouseEnter={() => hasVal && setHoveredCell({ year: yr, month: mIdx, val })}
                      onFocus={() => hasVal && setHoveredCell({ year: yr, month: mIdx, val })}
                      onMouseLeave={() => setHoveredCell(null)}
                      aria-label={
                        hasVal
                          ? `${mName} ${yr}: anomaly ${formatSigned(val, 2)} ${unit}`
                          : `${mName} ${yr}: no data`
                      }
                      className="h-3.5 rounded-[2px] border border-transparent hover:border-[var(--text)] focus:border-[var(--accent)] transition-colors"
                      style={{ backgroundColor: bg }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* One-line summary caption & compact legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
        <p>
          {fastestMonth ? (
            <>
              Fastest monthly shift:{' '}
              <strong className="text-[var(--text)] font-semibold">{fastestMonth.monthName}</strong>{' '}
              <span
                className="font-mono font-semibold"
                style={{ color: fastestMonth.slopePerDecade >= 0 ? 'var(--warm)' : 'var(--cool)' }}
              >
                ({formatSigned(fastestMonth.slopePerDecade, 2)} {unit}/dec)
              </span>
            </>
          ) : (
            'Monthly departures calculated relative to multi-year monthly climatology.'
          )}
        </p>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span style={{ color: 'var(--cool)' }}>−{maxAbsAnomaly.toFixed(1)}</span>
          <span
            className="w-16 h-2 rounded-full border border-[var(--border)]"
            style={{ background: 'linear-gradient(to right, var(--cool), var(--neutral-cell), var(--warm))' }}
            aria-hidden="true"
          />
          <span style={{ color: 'var(--warm)' }}>+{maxAbsAnomaly.toFixed(1)} {unit}</span>
        </div>
      </div>
    </div>
  );
});
