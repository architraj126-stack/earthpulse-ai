import axios from 'axios';

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
  const res = await api.get('/variables');
  return res.data;
};

export const getData = async (params) => {
  const res = await api.get('/data', { params });
  return res.data;
};

export const analyzeTrend = async (payload) => {
  const res = await api.post('/analyze', payload);
  return res.data;
};

export const compareRegions = async (payload) => {
  const res = await api.post('/compare', payload);
  return res.data;
};

export const askEarthPulseAI = async (question, currentAnalysis = null) => {
  const res = await api.post('/ai/ask', {
    question,
    current_analysis: currentAnalysis
  });
  return res.data;
};

export const getAnalysisHistory = async (limit = 15) => {
  const res = await api.get('/history', { params: { limit } });
  return res.data;
};

export const getKnowledgeList = async () => {
  const res = await api.get('/knowledge');
  return res.data;
};

export const getKnowledgeDoc = async (category, docName) => {
  const res = await api.get(`/knowledge/${category}/${docName}`);
  return res.data;
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
