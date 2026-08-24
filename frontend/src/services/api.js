import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const startCycle = async (userId = 1) => {
  const res = await api.post('/cycle/start-cycle', { user_id: userId });
  return res.data;
};

export const processAttempt = async (payload) => {
  const res = await api.post('/cycle/process-attempt', payload);
  return res.data;
};

export const endCycle = async (sessionId) => {
  const res = await api.post(`/cycle/end-cycle/${sessionId}`);
  return res.data;
};

export const getDashboardMetrics = async (userId = 1) => {
  const res = await api.get(`/dashboard/metrics/${userId}`);
  return res.data;
};

export const checkSystemHealth = async () => {
  try {
    const res = await api.get('/dashboard/metrics/1');
    return res.status === 200;
  } catch {
    return false;
  }
};

export default api;
