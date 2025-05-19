// src/services/authService.ts
import { LoginCredentials, RegistrationData, UserSignUpDTO } from '@/types/auth';
import api from './api'; // Import the central API client
import { HttpStatusCode } from 'axios';
import { User } from '@/types/user';
// import { User, LoginCredentials, RegistrationData } from '@/types/user'; // Assuming types

const authService = {
  login: async (credentials: LoginCredentials): Promise<string> => { // Replace 'any' with actual types

    try {
      // Assuming your backend login endpoint is POST /auth/login
      const response = await api.post('/auth/sign-in', { credentials });

      // Backend should set HttpOnly cookie with JWT in response headers
      // You don't get the token here, but you can return success or user info from response
      return response.data; // e.g., user info or success message
    } catch (error: any) {
      // Handle login error (wrong credentials, server error, etc.)
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  checkEmail: async (email: string): Promise<User | null> => {
    try {
      const response = await api.get('/auth/check-email', { params: { email } });
      // If valid email found, backend returns userDTO
      return response.data as UserSignUpDTO;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === HttpStatusCode.Conflict) {
          // User already registered
          throw new Error('UserAlreadyRegistered');
        } else if (error.response.status === HttpStatusCode.NotFound) {
          // Email not found in university database
          throw new Error('EmailNotFound');
        }
      }
      throw new Error('Unknown error during email check');
    }
  },


  signUp: async (email: string, phoneNo: string, rawPassword: string): Promise<void> => { // Replace 'any' with actual types
    try {
      const response = await api.post('/auth/sign-up', {
        email: email,
        phoneNo: phoneNo,
        rawPassword: rawPassword
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Sign up failed');
    }
  },

  // // Function to check if the user is currently authenticated (e.g., validates token/session)
  // checkAuthStatus: async (): Promise<AuthSuccessResponse | null> => { // Returns user data or null
  //   try {
  //     const response = await api.get('/auth/status');
  //     if (response.status === 200) {
  //       return response.data as AuthSuccessResponse; // Return user data
  //     }
  //     return null;
  //   } catch (error) {
  //     console.error('Auth status check failed:', error);
  //     // Handle specific errors like 401 if interceptor doesn't cover it
  //     return null;
  //   }
  // },

  logout: async (): Promise<void> => {
    try {
      // Call backend logout endpoint to clear the cookie
      const response = await api.post('/auth/logout');
      return response.data; // e.g., logout success message
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },
};

export default authService;