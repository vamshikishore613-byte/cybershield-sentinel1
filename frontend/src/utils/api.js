import axios from 'axios';

const API_BASE = 'https://cybershield-backend-new.onrender.com/api';
```

const api = axios.create({ baseURL: API_BASE });

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cs_token');
      localStorage.removeItem('cs_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const casesAPI = {
  create: (data) => api.post('/cases', data),
  list: () => api.get('/cases'),
  get: (id) => api.get(`/cases/${id}`),
  feedback: (id, feedback) => api.patch(`/cases/${id}/feedback`, { feedback }),
  fileComplaint: (id) => api.post(`/cases/${id}/file-complaint`),
};

export const evidenceAPI = {
  upload: (formData) => api.post('/evidence', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const actionPlansAPI = {
  get: (caseId) => api.get(`/action-plans/${caseId}`),
};

export const legalAPI = {
  downloadFIR: (caseId) => `${API_BASE}/legal-documents/fir/${caseId}`,
  downloadBankDispute: (caseId) => `${API_BASE}/legal-documents/bank-dispute/${caseId}`,
};

export const recoveryAPI = {
  get: (caseId) => api.get(`/recovery-plan/${caseId}`),
};

export const botAPI = {
  start: (caseId) => api.post(`/scammer-bot/start/${caseId}`),
  respond: (caseId, data) => api.post(`/scammer-bot/respond/${caseId}`, data),
};

export const familyAPI = {
  create: (data) => api.post('/family-shield/create', data),
  addMember: (data) => api.post('/family-shield/add-member', data),
  checkCall: (data) => api.post('/family-shield/check-call', data),
  getNetwork: () => api.get('/family-shield/network'),
};

export const scamDbAPI = {
  reportNumber: (data) => api.post('/scam-database/report-number', data),
  stats: () => api.get('/scam-database/stats'),
};

export const transactionAPI = {
  check: (data) => api.post('/transaction-guard/check', data),
  freeze: (data) => api.post('/transaction-guard/freeze', data),
  history: () => api.get('/transaction-guard/history'),
};

export default api;
