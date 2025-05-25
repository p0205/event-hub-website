// src/services/authService.ts
import { UserSignUpDTO } from '@/types/auth';
import api from './api'; // Import the central API client
import { HttpStatusCode } from 'axios';
import { User } from '@/types/user';
// import { User, LoginCredentials, RegistrationData } from '@/types/user'; // Assuming types

const authService = {

  checkAuth: async (): Promise<User | null> => { // Replace 'any' with actual types


    try {
      // Assuming your backend login endpoint is POST /auth/login
      const response = await api.get('/auth/me');

      console.log(response.headers);
      return response.data; // e.g., user info or success message
    } catch (error: any) {
      // Handle login error (wrong credentials, server error, etc.)
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },


  signIn: async (email: string, rawPassword: string): Promise<User | null> => { // Replace 'any' with actual types
    try {
      // Assuming your backend login endpoint is POST /auth/login
      const response = await api.post('/auth/sign-in', {
        email: email,
        rawPassword: rawPassword
      });
      console.log(response.headers);
      return response.data as User; // e.g., user info or success message
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

  signOut: async (): Promise<void> => {
    try {
      // Call backend logout endpoint to clear the cookie
      await api.post('/auth/sign-out');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Sign Out failed');
    }
  },
};

export default authService;