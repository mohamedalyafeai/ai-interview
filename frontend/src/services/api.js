import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth
export const authService = {
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  callback: (sessionId) => api.post('/auth/callback', {}, {
    headers: { 'X-Session-ID': sessionId }
  }),
  manualSignup: (data) => api.post('/auth/manual-signup', data),
  manualLogin: (data) => api.post('/auth/manual-login', data)
};

// Interview
export const interviewService = {
  start: (data) => api.post('/interview/start', data),
  answer: (data) => api.post('/interview/answer', data),
  complete: (interviewId) => api.post('/interview/complete', { interview_id: interviewId }),
  getHistory: () => api.get('/interview/history')
};

// Resume
export const resumeService = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHistory: () => api.get('/resume/history')
};

// Dashboard
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats')
};
