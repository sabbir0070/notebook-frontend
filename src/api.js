import axios from 'axios';

// Update base URL depending on environment if needed
const API_URL = 'https://notebook-server-gilt.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
});

// Set token from localStorage on every request
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

export default api;
