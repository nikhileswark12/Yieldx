import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT
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

// Add a response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const changePassword = (data) => api.post('/auth/change-password', data);

// Prediction Services
export const predictYield = (data) => api.post('/predict/yield', data);
export const predictCrop = (data) => api.post('/predict/crop', data);
export const getPredictionHistory = (params) => api.get('/predict/history', { params });
export const getPredictionDetails = (id) => api.get(`/predict/${id}`);
export const deletePrediction = (id) => api.delete(`/predict/${id}`);

// Crop Services
export const getCrops = () => api.get('/crops');
export const getCropById = (id) => api.get(`/crops/${id}`);
export const getCropByName = (name) => api.get(`/crops/name/${name}`);

// Weather Services
export const getWeather = (location) => api.get(`/weather/${location}`);
export const getWeatherForecast = (location) => api.get(`/weather/forecast/${location}`);

// Analytics Services
export const getRegionAnalytics = (params) => api.get('/analytics/region', { params });
export const getSeasonalAnalytics = (params) => api.get('/analytics/seasonal', { params });
export const getCropRanking = (params) => api.get('/analytics/crop-ranking', { params });
export const getSummaryStats = () => api.get('/analytics/summary');

export default api;
