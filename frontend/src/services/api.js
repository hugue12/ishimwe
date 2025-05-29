import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api';

console.log('API Base URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  checkAuth: async () => {
    const response = await api.get('/auth/check');
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

// Cars API
export const carsAPI = {
  getAll: async () => {
    const response = await api.get('/cars');
    return response.data;
  },

  getByPlateNumber: async (plateNumber) => {
    const response = await api.get(`/cars/${plateNumber}`);
    return response.data;
  },

  create: async (carData) => {
    const response = await api.post('/cars', carData);
    return response.data;
  },

  update: async (plateNumber, carData) => {
    const response = await api.put(`/cars/${plateNumber}`, carData);
    return response.data;
  },

  delete: async (plateNumber) => {
    console.log('API delete called with plate number:', plateNumber);
    const encodedPlateNumber = encodeURIComponent(plateNumber);
    console.log('Encoded plate number:', encodedPlateNumber);
    const response = await api.delete(`/cars/${encodedPlateNumber}`);
    return response.data;
  },
};

// Packages API
export const packagesAPI = {
  getAll: async () => {
    const response = await api.get('/packages');
    return response.data;
  },

  getByNumber: async (packageNumber) => {
    const response = await api.get(`/packages/${packageNumber}`);
    return response.data;
  },

  create: async (packageData) => {
    const response = await api.post('/packages', packageData);
    return response.data;
  },

  update: async (packageNumber, packageData) => {
    const response = await api.put(`/packages/${packageNumber}`, packageData);
    return response.data;
  },

  delete: async (packageNumber) => {
    const response = await api.delete(`/packages/${packageNumber}`);
    return response.data;
  },
};

// Service Packages API
export const servicePackagesAPI = {
  getAll: async () => {
    const response = await api.get('/service-packages');
    return response.data;
  },

  getByRecordNumber: async (recordNumber) => {
    const response = await api.get(`/service-packages/${recordNumber}`);
    return response.data;
  },

  getByDateRange: async (startDate, endDate) => {
    const response = await api.get(`/service-packages/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  create: async (serviceData) => {
    const response = await api.post('/service-packages', serviceData);
    return response.data;
  },

  update: async (recordNumber, serviceData) => {
    const response = await api.put(`/service-packages/${recordNumber}`, serviceData);
    return response.data;
  },

  delete: async (recordNumber) => {
    const response = await api.delete(`/service-packages/${recordNumber}`);
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  getByPaymentNumber: async (paymentNumber) => {
    const response = await api.get(`/payments/${paymentNumber}`);
    return response.data;
  },

  getByRecordNumber: async (recordNumber) => {
    const response = await api.get(`/payments/record/${recordNumber}`);
    return response.data;
  },

  getByDateRange: async (startDate, endDate) => {
    const response = await api.get(`/payments/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  generateBill: async (paymentNumber) => {
    const response = await api.get(`/payments/bill/${paymentNumber}`);
    return response.data;
  },

  create: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  update: async (paymentNumber, paymentData) => {
    const response = await api.put(`/payments/${paymentNumber}`, paymentData);
    return response.data;
  },

  delete: async (paymentNumber) => {
    const response = await api.delete(`/payments/${paymentNumber}`);
    return response.data;
  },
};

export default api;
