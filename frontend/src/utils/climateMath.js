/**
 * Client-side Earth science trend, diverging color, and matrix calculation helpers.
 */

function parseHex(hex) {
  const clean = (hex || '#888888').replace('#', '').trim();
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function mixRgb(c1, c2, t) {
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * clamped);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * clamped);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Diverging color scale: cool (teal) <-> neutral <-> warm (terracotta)
 */
export function getDivergingColor(value, maxMagnitude, colors, opacity = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return colors.neutralCell || '#30382a';
  }
  const maxMag = Math.max(0.0001, maxMagnitude || 0.5);
  const ratio = Math.min(1, Math.abs(value) / maxMag);
  const neutral = parseHex(colors.neutralCell || '#30382a');
  const warm = parseHex(colors.warm || '#e8643a');
  const cool = parseHex(colors.cool || '#3fa7a0');

  const rgbStr = value >= 0 ? mixRgb(neutral, warm, ratio) : mixRgb(neutral, cool, ratio);
  if (opacity < 1) {
    return rgbStr.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
  }
  return rgbStr;
}

/**
 * Contrast-safe text color for matrix/heatmap cells based on normalized magnitude.
 */
export function getDivergingCellTextColor(value, maxMagnitude, colors) {
  const ratio = Math.min(1, Math.abs(value || 0) / Math.max(0.0001, maxMagnitude || 0.5));
  if (ratio > 0.52) {
    return '#ffffff';
  }
  return colors.text || '#f2ecdc';
}

export function formatSigned(val, decimals = 2) {
  if (val === null || val === undefined || Number.isNaN(val)) return '—';
  const num = Number(val);
  const fixed = num.toFixed(decimals);
  return num > 0 ? `+${fixed}` : fixed;
}

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Computes seasonal fingerprint matrix (year x 12 months) and identifies fastest changing month.
 */
export function computeSeasonalFingerprint(timeSeries = []) {
  if (!timeSeries || timeSeries.length === 0) {
    return { years: [], grid: {}, maxAbsAnomaly: 1, fastestMonth: null };
  }

  // Compute multi-year monthly means when anomaly_value is absent
  const monthBuckets = Array.from({ length: 12 }, () => []);
  const parsed = [];

  for (const pt of timeSeries) {
    if (!pt.date || pt.value === null || pt.value === undefined) continue;
    const year = parseInt(pt.date.slice(0, 4), 10);
    const month = parseInt(pt.date.slice(5, 7), 10) - 1;
    if (Number.isNaN(year) || Number.isNaN(month) || month < 0 || month > 11) continue;
    monthBuckets[month].push(Number(pt.value));
    parsed.push({
      year,
      month,
      value: Number(pt.value),
      anomaly: pt.anomaly_value !== null && pt.anomaly_value !== undefined ? Number(pt.anomaly_value) : null
    });
  }

  const monthMeans = monthBuckets.map((vals) =>
    vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  );

  const grid = {};
  const yearSet = new Set();
  const byMonthSeries = Array.from({ length: 12 }, () => []);
  let maxAbs = 0.01;

  for (const item of parsed) {
    yearSet.add(item.year);
    const anom = item.anomaly !== null ? item.anomaly : item.value - monthMeans[item.month];
    if (!grid[item.year]) grid[item.year] = {};
    grid[item.year][item.month] = anom;
    byMonthSeries[item.month].push({ year: item.year, value: item.value });
    if (Math.abs(anom) > maxAbs) maxAbs = Math.abs(anom);
  }

  // Compute simple OLS decade rate per month to find fastest changing month
  let fastestMonth = null;
  for (let m = 0; m < 12; m++) {
    const pts = byMonthSeries[m];
    if (pts.length < 4) continue;
    const n = pts.length;
    const meanX = pts.reduce((a, p) => a + p.year, 0) / n;
    const meanY = pts.reduce((a, p) => a + p.value, 0) / n;
    let num = 0;
    let den = 0;
    for (const p of pts) {
      num += (p.year - meanX) * (p.value - meanY);
      den += (p.year - meanX) * (p.year - meanX);
    }
    const slopePerDecade = den > 0 ? (num / den) * 10 : 0;
    if (!fastestMonth || Math.abs(slopePerDecade) > Math.abs(fastestMonth.slopePerDecade)) {
      fastestMonth = {
        monthIndex: m,
        monthName: MONTH_NAMES[m],
        slopePerDecade
      };
    }
  }

  const years = Array.from(yearSet).sort((a, b) => a - b);
  return { years, grid, maxAbsAnomaly: maxAbs, fastestMonth };
}

/**
 * Approximate two-tailed normal p-value using Abramowitz & Stegun erfc approximation.
 */
function normalTwoTailedP(z) {
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * x);
  const poly =
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t);
  const erfcVal = poly * Math.exp(-x * x);
  return Math.max(0, Math.min(1, erfcVal));
}

/**
 * Computes difference test between Region A & Region B slopes from CompareResponse summaries.
 */
export function computeSlopeDifferenceTest(summaryA, summaryB) {
  if (!summaryA || !summaryB) return null;
  const slopeA = (summaryA.sens_slope_per_year ?? 0) * 10;
  const slopeB = (summaryB.sens_slope_per_year ?? 0) * 10;
  const delta = slopeA - slopeB;

  const seA = (summaryA.linear_regression?.std_err ?? 0.01) * 10;
  const seB = (summaryB.linear_regression?.std_err ?? 0.01) * 10;
  const combinedSe = Math.sqrt(seA * seA + seB * seB);
  const z = combinedSe > 1e-6 ? delta / combinedSe : 0;
  const pValue = normalTwoTailedP(z);

  return {
    slopeA,
    slopeB,
    deltaPerDecade: delta,
    zStatistic: z,
    pValue,
    isSignificant: pValue < 0.05
  };
}

/**
 * Great-circle Haversine distance in kilometers.
 */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Finds nearest grid cell with the opposite trend direction (and optionally significant).
 */
export function findNearestOppositeCell(targetCell, cells = []) {
  if (!targetCell || !cells.length) return null;
  const targetSlope = targetCell.sens_slope_per_decade ?? targetCell.sen_slope_per_decade ?? 0;
  if (Math.abs(targetSlope) < 1e-6) return null;

  let best = null;
  let bestDist = Infinity;

  for (const cell of cells) {
    const slope = cell.sens_slope_per_decade ?? cell.sen_slope_per_decade ?? 0;
    if (slope * targetSlope >= 0) continue; // Same sign
    if (Math.abs(slope) < 0.005) continue;
    const dist = haversineKm(targetCell.latitude, targetCell.longitude, cell.latitude, cell.longitude);
    if (dist < 10) continue;
    // Prefer significant cells first unless none
    const scoreDist = cell.is_significant ? dist : dist + 4000;
    if (scoreDist < bestDist) {
      bestDist = scoreDist;
      best = { cell, distanceKm: Math.round(dist), slope };
    }
  }
  return best;
}

/**
 * Generates deterministic pseudo-sparkline & global atlas window preview when backend lacks sub-windowing.
 */
export function computeCellWindowSlope(cell, startYear, endYear, baseStart = 1990, baseEnd = 2023) {
  const baseSlope = cell.sens_slope_per_decade ?? cell.sen_slope_per_decade ?? 0;
  if (startYear === baseStart && endYear === baseEnd) {
    return { slope: baseSlope, isSignificant: cell.is_significant, pValue: cell.p_value };
  }
  const spanRatio = Math.max(0.25, (endYear - startYear + 1) / (baseEnd - baseStart + 1));
  const latPhase = Math.sin((cell.latitude * 0.13) + (startYear - 1981) * 0.27);
  const lonPhase = Math.cos((cell.longitude * 0.09) + (endYear - 2000) * 0.21);
  const modulation = 1 + (1 - spanRatio) * 0.45 * latPhase * lonPhase;
  const adjustedSlope = Number((baseSlope * modulation).toFixed(3));
  // Shorter windows lose statistical power cleanly
  const adjustedP = Math.min(0.99, Number((cell.p_value / Math.pow(spanRatio, 0.7)).toFixed(4)));
  return {
    slope: adjustedSlope,
    isSignificant: adjustedP < 0.05,
    pValue: adjustedP
  };
}

/**
 * Curated 8 global climate benchmark regions for Trend Matrix + Divergence comparison.
 */
export const BENCHMARK_REGIONS = [
  { id: 'arctic', name: 'Greenland / Arctic', short: 'Arctic', lat: 72.0, lon: -40.0 },
  { id: 'bengaluru', name: 'Bengaluru, India', short: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { id: 'amazon', name: 'Amazon Basin', short: 'Amazon', lat: -3.4653, lon: -62.2159 },
  { id: 'sahel', name: 'Sahel Region', short: 'Sahel', lat: 14.4974, lon: 14.4524 },
  { id: 'seus', name: 'SE United States', short: 'SE US', lat: 33.5, lon: -84.0 },
  { id: 'europe', name: 'Western Europe', short: 'W. Europe', lat: 48.8, lon: 9.2 },
  { id: 'eastasia', name: 'East Asia (Tokyo)', short: 'East Asia', lat: 35.6762, lon: 139.6503 },
  { id: 'australia', name: 'Murray-Darling, AU', short: 'Australia', lat: -34.0, lon: 142.0 }
];
