import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('shop');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data: any) => api.post('/auth/change-password', data),
};

// Customer API
export const customerAPI = {
  getAll: () => api.get('/customers'),
  getById: (id: number) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: number, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
  search: (query: string) => api.get(`/customers/search?q=${query}`),
};

// Loan API
export const loanAPI = {
  getAll: (status?: string) => api.get('/loans', { params: { status } }),
  getById: (id: number) => api.get(`/loans/${id}`),
  create: (data: any) => api.post('/loans', data),
  getByCustomer: (customerId: number) => api.get(`/loans/customer/${customerId}`),
  getOverdue: () => api.get('/loans/overdue'),
  close: (id: number) => api.post(`/loans/${id}/close`),
};

// Payment API
export const paymentAPI = {
  getAll: (limit?: number) => api.get('/payments', { params: { limit } }),
  getById: (id: number) => api.get(`/payments/${id}`),
  create: (data: any) => api.post('/payments', data),
  getByLoan: (loanId: number) => api.get(`/payments/loan/${loanId}`),
  getToday: () => api.get('/payments/today'),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentLoans: (limit?: number) => api.get('/dashboard/recent-loans', { params: { limit } }),
  getRecentPayments: (limit?: number) => api.get('/dashboard/recent-payments', { params: { limit } }),
};

// PDF API
export const pdfAPI = {
  getLoanSanction: (loanId: number) => api.get(`/pdf/loan/${loanId}`, { responseType: 'blob' }),
  getPaymentReceipt: (paymentId: number) => api.get(`/pdf/payment/${paymentId}`, { responseType: 'blob' }),
};

// Export API
export const exportAPI = {
  exportLoans: (status?: string) => api.get('/export/loans', { params: { status }, responseType: 'blob' }),
  exportPayments: (limit?: number) => api.get('/export/payments', { params: { limit }, responseType: 'blob' }),
  exportCustomers: () => api.get('/export/customers', { responseType: 'blob' }),
  exportDashboard: () => api.get('/export/dashboard', { responseType: 'blob' }),
};

// Shop API
export const shopAPI = {
  getProfile: () => api.get('/shop/profile'),
  update: (data: any) => api.put('/shop/profile', data),
};
