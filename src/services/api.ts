// src/services/api.ts (using axios example)
import axios from 'axios';

// Use an environment variable for the backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BACKEND_API_URL,
  // You can add a timeout here
  // timeout: 10000,
});

// Optional: Add a request interceptor to include auth tokens
api.interceptors.request.use(
  config => {
    // Get your auth token (e.g., from localStorage, a cookie, or AuthContext)
    // Note: Accessing localStorage directly requires 'use client' or checking typeof window
    // A more secure approach for tokens is often using HTTP-only cookies managed by your backend/API routes
    // const token = localStorage.getItem('authToken'); // Less secure client-side storage example

    // If you have a token, add it to the Authorization header
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  error => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for global error handling or token refresh
// api.interceptors.response.use(
//   response => response,
//   error => {
//     // Handle global API errors (e.g., log out user on 401 Unauthorized)
//     if (error.response && error.response.status === 401) {
//       // Redirect to login page, clear auth state, etc.
//       console.error('Unauthorized request, redirecting to login...');
//       // window.location.href = '/login'; // Client-side redirect example
//     }
//     return Promise.reject(error);
//   }
// );

export default api;