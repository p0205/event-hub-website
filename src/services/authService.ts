// src/services/authService.ts
import { AuthSuccessResponse, LoginCredentials, RegistrationData } from '@/types/auth';
import api from './api'; // Import the central API client
// import { User, LoginCredentials, RegistrationData } from '@/types/user'; // Assuming types

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthSuccessResponse> => { // Replace 'any' with actual types
    const response = await api.post('/auth/login', credentials);
    return response.data; // axios puts the response body in .data
  },

  register: async (userData: RegistrationData): Promise<AuthSuccessResponse> => { // Replace 'any' with actual types
     const response = await api.post('/auth/register', userData);
     return response.data;
  },

  // Function to check if the user is currently authenticated (e.g., validates token/session)
  checkAuthStatus: async (): Promise<AuthSuccessResponse | null> => { // Returns user data or null
     try {
         const response = await api.get('/auth/status');
         if (response.status === 200) {
             return response.data as AuthSuccessResponse; // Return user data
         }
         return null;
     } catch (error) {
         console.error('Auth status check failed:', error);
         // Handle specific errors like 401 if interceptor doesn't cover it
         return null;
     }
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

export default authService;