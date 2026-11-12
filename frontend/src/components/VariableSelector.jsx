import React, { useState, useMemo } from 'react';
import { Search, Thermometer, CloudRain, Droplets, Wind, Sun, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

const VARIABLE_ICONS = {
  T2M: Thermometer,
  PRECTOTCORR: CloudRain,
  RH2M: Droplets,
  WS2M: Wind,
  ALLSKY_SFC_SW_DWN: Sun
};

const DOMAIN_MAPPING = {
  All: ['T2M', 'PRECTOTCORR', 'RH2M', 'WS2M', 'ALLSKY_SFC_SW_DWN'],
  Atmosphere: ['T2M', 'PRECTOTCORR', 'RH2M', 'WS2M', 'ALLSKY_SFC_SW_DWN'],
  Land: ['T2M', 'PRECTOTCORR', 'RH2M', 'ALLSKY_SFC_SW_DWN'],
  Ocean: ['T2M', 'PRECTOTCORR', 'WS2M'],
  Cryosphere: ['T2M', 'ALLSKY_SFC_SW_DWN']
};

const DEFAULT_SPARKLINES = {
  T2M: { points: [0.1, 0.2, 0.15, 0.35, 0.42, 0.55, 0.68, 0.85], slope: 0.32 },
  PRECTOTCORR: { points: [0.4, 0.52, 0.38, 0.45, 0.5, 0.41, 0.48, 0.54], slope: 0.04 },
  RH2M: { points: [0.7, 0.65, 0.62, 0.58, 0.6, 0.51, 0.48, 0.42], slope: -0.35 },
  WS2M: { points: [0.6, 0.58, 0.55, 0.53, 0.52, 0.49, 0.47, 0.44], slope: -0.06 },
  ALLSKY_SFC_SW_DWN: { points: [0.35, 0.4, 0.38, 0.44, 0.46, 0.49, 0.51, 0.56], slope: 0.05 }
};

function MiniSparkline({ points = [], color }) {
  if (!points.length) return null;
  const w = 42;
  const h = 16;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(0.001, max - min);
  const d = points
    .map((p, idx) => {
      const x = (idx / Math.max(1, points.length - 1)) * w;
      const y = h - ((p - min) / span) * (h - 4) - 2;
      return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="shrink-0">
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function VariableSelector({
  variables = [],
  selectedVariable = 'T2M',
  onSelectVariable,
  variableHints = {},
  compact = false
}) {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Atmosphere', 'Land', 'Ocean', 'Cryosphere'];

  const filtered = useMemo(() => {
    const allowedParams = DOMAIN_MAPPING[selectedCategory] || DOMAIN_MAPPING.All;
    return variables.filter((v) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.parameter.toLowerCase().includes(q) ||
        v.definition.toLowerCase().includes(q);
      const matchesCategory = allowedParams.includes(v.parameter);
      return matchesSearch && matchesCategory;
    });
  }, [variables, search, selectedCategory]);

  return (
    <div className={compact ? 'space-y-2.5' : 'bg-[var(--card)] rounded-[14px] border border-[var(--border)] p-4 space-y-4'}>
      {/* Search box */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={compact ? 'Search variables (T2M, rain...)' : 'Search variables by name, parameter, or definition...'}
          aria-label="Search environmental variables"
          className="w-full bg-[var(--panel)] border border-[var(--border)] rounded-[10px] px-3 py-1.5 pl-8 text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
        />
        <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-2" aria-hidden="true" />
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-1" role="group" aria-label="Variable categories">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={isActive}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                isActive
                  ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)] font-semibold'
                  : 'bg-[var(--panel)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Variable List */}
      <div className={compact ? 'space-y-1.5' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5'}>
        {filtered.map((item) => {
          const isSelected = selectedVariable === item.parameter;
          const Icon = VARIABLE_ICONS[item.parameter] || Thermometer;
          const hint = variableHints[item.parameter] || DEFAULT_SPARKLINES[item.parameter] || { points: [0, 0.2, 0.4], slope: 0 };
          const isUp = hint.slope > 0.01;
          const isDown = hint.slope < -0.01;
          const semanticColor = isUp ? colors.warm : isDown ? colors.cool : colors.muted;
          const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

          return (
            <button
              key={item.parameter}
              type="button"
              onClick={() => onSelectVariable(item.parameter)}
              aria-pressed={isSelected}
              className={`w-full text-left rounded-[12px] p-2.5 border transition-colors flex items-center justify-between gap-2 relative overflow-hidden ${
                isSelected
                  ? 'bg-[var(--accent-soft)] border-[var(--accent)]'
                  : 'bg-[var(--panel)] border-[var(--border)] hover:border-[var(--muted)]'
              }`}
            >
              {/* Left Semantic Colour Bar */}
              <span
                className="w-1 self-stretch rounded-full shrink-0"
                style={{ backgroundColor: semanticColor }}
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" aria-hidden="true" />
                  <span className="text-xs font-semibold text-[var(--text)] truncate">
                    {item.short_name || item.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono text-[var(--muted)]">
                  <span>{item.parameter}</span>
                  <span>·</span>
                  <span>{item.unit}</span>
                </div>
              </div>

              {/* Sparkline + Arrow */}
              <div className="flex items-center gap-1.5 shrink-0">
                <MiniSparkline points={hint.points} color={semanticColor} />
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold"
                  style={{ color: semanticColor }}
                  title={`Global reference trend: ${hint.slope > 0 ? '+' : ''}${hint.slope}/dec`}
                >
                  <TrendIcon className="w-3 h-3" aria-hidden="true" />
                  <span>{hint.slope > 0 ? '+' : ''}{Number(hint.slope).toFixed(2)}</span>
                </span>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-xs text-[var(--muted)] py-3 text-center col-span-full">
            No matching variables for &ldquo;{search || selectedCategory}&rdquo;.
          </p>
        )}
      </div>
    </div>
  );
}
