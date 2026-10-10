import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Request interceptor for token attachment
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('findit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      // Token expired or invalid
      localStorage.removeItem('findit_token');
      localStorage.removeItem('findit_user');
      // Only redirect if not already on login/register
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  logout: () => api.post('/auth/logout'),
};

export const reportAPI = {
  createLost: (formData) =>
    api.post('/reports/lost', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  createFound: (formData) =>
    api.post('/reports/found', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getReports: (params) => api.get('/reports', { params }),
  getReportById: (id) => api.get(`/reports/${id}`),
  updateReport: (id, formData) =>
    api.put(`/reports/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteReport: (id) => api.delete(`/reports/${id}`),
  getMyReports: () => api.get('/reports/user/me'),
};

export const matchAPI = {
  getMatches: (params) => api.get('/matches', { params }),
  getMatchById: (id) => api.get(`/matches/${id}`),
  updateStatus: (id, status) => api.patch(`/matches/${id}/status`, { status }),
  recalculate: () => api.post('/matches/recalculate'),
};

export const claimAPI = {
  createClaim: (data) => api.post('/claims', data),
  getMyClaims: () => api.get('/claims/my'),
  getClaims: (params) => api.get('/claims', { params }),
  reviewClaim: (id, data) => api.patch(`/claims/${id}/review`, data),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  toggleSuspicious: (id) => api.patch(`/admin/reports/${id}/suspicious`),
};

export default api;
