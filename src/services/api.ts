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



export default api;