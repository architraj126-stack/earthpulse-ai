/**
 * Largest-Triangle-Three-Buckets (LTTB) Downsampling Algorithm
 * Downsamples time-series data while preserving visually significant peaks, valleys, and trends.
 * 
 * @param {Array} data - Array of data points with 'date' and numerical fields (e.g. 'value', 'anomaly_value', 'trend_value')
 * @param {number} threshold - Maximum number of points to retain (default: 1000)
 * @returns {Array} - Downsampled array of data points
 */
export function downsampleLTTB(data, threshold = 1000) {
  if (!data || data.length <= threshold || threshold < 3) {
    return data || [];
  }

  const sampled = [];
  const dataLength = data.length;
  const every = (dataLength - 2) / (threshold - 2);

  let a = 0; // Initially the first point in the series
  sampled.push(data[a]);

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate point average for the next bucket (bucket C)
    let avgX = 0;
    let avgY = 0;
    let avgCount = 0;

    const nextBucketStart = Math.floor((i + 1) * every) + 1;
    const nextBucketEnd = Math.min(Math.floor((i + 2) * every) + 1, dataLength);

    for (let j = nextBucketStart; j < nextBucketEnd; j++) {
      avgX += j;
      avgY += (data[j].value !== null && data[j].value !== undefined) ? Number(data[j].value) : 0;
      avgCount++;
    }

    if (avgCount > 0) {
      avgX /= avgCount;
      avgY /= avgCount;
    }

    // Current bucket range (bucket B)
    const currentBucketStart = Math.floor(i * every) + 1;
    const currentBucketEnd = Math.min(Math.floor((i + 1) * every) + 1, dataLength);

    // Point A coordinates
    const pointAX = a;
    const pointAY = (data[a].value !== null && data[a].value !== undefined) ? Number(data[a].value) : 0;

    let maxArea = -1;
    let maxAreaPointIndex = currentBucketStart;

    for (let j = currentBucketStart; j < currentBucketEnd; j++) {
      const pointY = (data[j].value !== null && data[j].value !== undefined) ? Number(data[j].value) : 0;
      // Calculate triangle area over A, B, and C
      const area = Math.abs(
        (pointAX - avgX) * (pointY - pointAY) -
        (pointAX - j) * (avgY - pointAY)
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaPointIndex = j;
      }
    }

    sampled.push(data[maxAreaPointIndex]);
    a = maxAreaPointIndex; // Next A is this chosen point
  }

  // Always keep the final point
  sampled.push(data[dataLength - 1]);
  return sampled;
}
