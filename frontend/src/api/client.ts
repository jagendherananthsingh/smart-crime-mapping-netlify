/// <reference types="vite/client" />
import axios from 'axios';

const resolveApiBaseUrl = (): string => {
  // When hosted on Netlify, Vercel, or remote HTTPS hosts, default to relative '/api'
  // to avoid browser Mixed Content security errors and allow Netlify redirects/rewrites.
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl.endsWith('/api') && !cleanUrl.includes('/api/')) {
      return `${cleanUrl}/api`;
    }
    return cleanUrl;
  }

  return 'http://localhost:5000/api';
};

export const API_BASE_URL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized / Expired Session & Retry Network Errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Retry on Network Error (e.g. backend booting up) up to 2 times
    if (!error.response && config && !config._retryCount) {
      config._retryCount = (config._retryCount || 0) + 1;
      if (config._retryCount <= 2) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return apiClient(config);
      }
    }

    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if session expires
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
