import axios from 'axios';
import { appRequestCache } from '../utils/requestCache';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// In-flight request de-duplication registry
const pendingRequests = new Map();

api.interceptors.request.use((config) => {
  const reqKey = `${config.method}:${config.url}:${JSON.stringify(config.params || {})}:${JSON.stringify(config.data || {})}`;
  config._reqKey = reqKey;
  return config;
});

// Exponential backoff retry interceptor for 502/503/504 and network timeouts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;
    if (!config) return Promise.reject(error);

    config.__retryCount = config.__retryCount || 0;
    const shouldRetry = (
      config.__retryCount < 2 &&
      (
        error.code === 'ECONNABORTED' ||
        !error.response ||
        [502, 503, 504].includes(error.response?.status)
      )
    );

    if (shouldRetry) {
      config.__retryCount += 1;
      const delayMs = 800 * Math.pow(2, config.__retryCount - 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const getVariables = async () => {
  const cacheKey = 'variables:all';
  return appRequestCache.fetchWithCache(cacheKey, async () => {
    const res = await api.get('/variables');
    return res.data;
  }, 60 * 60 * 1000); // 1 hour TTL
};

export const getData = async (params) => {
  const cacheKey = appRequestCache.generateKey('data', params);
  return appRequestCache.fetchWithCache(cacheKey, async () => {
    const res = await api.get('/data', { params });
    return res.data;
  }, 5 * 60 * 1000); // 5 min TTL
};

export const analyzeTrend = async (payload) => {
  const cacheKey = appRequestCache.generateKey('analyze', payload);
  return appRequestCache.fetchWithCache(cacheKey, async () => {
    const res = await api.post('/analyze', payload);
    return res.data;
  }, 10 * 60 * 1000);
};

export const compareRegions = async (payload) => {
  const cacheKey = appRequestCache.generateKey('compare', payload);
  return appRequestCache.fetchWithCache(cacheKey, async () => {
    const res = await api.post('/compare', payload);
    return res.data;
  }, 10 * 60 * 1000);
};

export const getAtlas = async (variable = 'T2M', bypassCache = false) => {
  const cacheKey = `atlas:${variable}`;
  if (bypassCache) {
    appRequestCache.invalidate(cacheKey);
  }
  return appRequestCache.fetchWithCache(cacheKey, async () => {
    const res = await api.get('/atlas', { params: { variable } });
    return res.data;
  }, 30 * 60 * 1000); // 30 min TTL
};

export const getTopAtlas = async (variable = 'T2M', n = 10) => {
  const cacheKey = `atlas:top:${variable}:${n}`;
  return appRequestCache.fetchWithCache(cacheKey, async () => {
    const res = await api.get('/atlas/top', { params: { variable, n } });
    return res.data;
  }, 30 * 60 * 1000);
};

export const askEarthPulseAI = async (question, currentAnalysis = null, chatHistory = null) => {
  const res = await api.post('/ai/ask', {
    question,
    current_analysis: currentAnalysis,
    chat_history: chatHistory
  });
  return res.data;
};

export const getAnalysisHistory = async (limit = 15) => {
  const res = await api.get('/history', { params: { limit } });
  return res.data;
};

export const getKnowledgeList = async () => {
  return appRequestCache.fetchWithCache('knowledge:list', async () => {
    const res = await api.get('/knowledge');
    return res.data;
  }, 30 * 60 * 1000);
};

export const getKnowledgeDoc = async (category, docName) => {
  const cacheKey = `knowledge:${category}:${docName}`;
  return appRequestCache.fetchWithCache(cacheKey, async () => {
    const res = await api.get(`/knowledge/${category}/${docName}`);
    return res.data;
  }, 30 * 60 * 1000);
};

export const getDetectiveCases = async () => {
  try {
    const res = await api.get('/detective-cases');
    return res.data;
  } catch {
    const fallback = await import('../data/detective_cases.json');
    return fallback.default || fallback;
  }
};

export const getPdfReportUrl = (params) => {
  const searchParams = new URLSearchParams(params);
  return `${API_BASE}/report?${searchParams.toString()}`;
};

export const getCsvExportUrl = (params) => {
  const searchParams = new URLSearchParams(params);
  return `${API_BASE}/export/csv?${searchParams.toString()}`;
};

export default api;
