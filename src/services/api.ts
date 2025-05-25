// src/services/api.ts (using axios example)
import axios from 'axios';
import qs from 'qs';

// Use an environment variable for the backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BACKEND_API_URL,
  withCredentials: true, // IMPORTANT: send cookies with every request
  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }),
});

// Optional: Add a request interceptor to include auth tokens
api.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 responses
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Only redirect if we're not already on an auth page
        // and this is not an auth-related API call
        const currentPath = window.location.pathname
        const isAuthPage = currentPath.includes('/sign-in') || 
                          currentPath.includes('/sign-up') || 
                          currentPath.includes('/check-email')
        
        const isAuthApiCall = error.config?.url?.includes('/auth/me') ||
                             error.config?.url?.includes('/auth/signin') ||
                             error.config?.url?.includes('/auth/signout')

        // Don't redirect if:
        // 1. We're already on an auth page, OR
        // 2. This is an auth API call (let the component handle it)
        if (!isAuthPage && !isAuthApiCall) {
          console.log('Redirecting to sign-in page due to 401')
          window.location.href = '/sign-in'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api;