/**
 * Lightweight Frontend Request Cache with TTL and Promise Deduplication
 */

class RequestCache {
  constructor(defaultTtlMs = 10 * 60 * 1000) { // 10 minutes default
    this.cache = new Map();
    this.inFlight = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  generateKey(prefix, params = {}) {
    const sortedEntries = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .sort(([a], [b]) => a.localeCompare(b));
    return `${prefix}:${JSON.stringify(sortedEntries)}`;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data, ttlMs = this.defaultTtlMs) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
    // Evict oldest if cache exceeds 100 entries
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  async fetchWithCache(key, fetcher, ttlMs) {
    const cached = this.get(key);
    if (cached) {
      return cached;
    }

    if (this.inFlight.has(key)) {
      return this.inFlight.get(key);
    }

    const promise = (async () => {
      try {
        const result = await fetcher();
        this.set(key, result, ttlMs);
        return result;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  delete(key) {
    this.cache.delete(key);
    this.inFlight.delete(key);
  }

  invalidate(key) {
    this.delete(key);
  }

  clear() {
    this.cache.clear();
    this.inFlight.clear();
  }
}

export const appRequestCache = new RequestCache();
