import axios from 'axios';
import { appRequestCache } from '../utils/requestCache';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

export const getAtlas = async (variable = 'T2M') => {
  const cacheKey = `atlas:${variable}`;
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

export const getPdfReportUrl = (params) => {
  const searchParams = new URLSearchParams(params);
  return `/api/report?${searchParams.toString()}`;
};

export const getCsvExportUrl = (params) => {
  const searchParams = new URLSearchParams(params);
  return `/api/export/csv?${searchParams.toString()}`;
};

export default api;
