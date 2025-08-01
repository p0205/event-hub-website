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
    } catch (error: unknown) {
      // Handle login error (wrong credentials, server error, etc.)
      const errorResponse = error as { response?: { data?: { message?: string } } };
      throw new Error(errorResponse.response?.data?.message || 'Login failed');
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
    } catch (error: unknown) {
      // Handle login error (wrong credentials, server error, etc.)
      const errorResponse = error as { response?: { data?: { message?: string } } };
      throw new Error(errorResponse.response?.data?.message || 'Login failed');
    }
  },

  checkEmail: async (email: string): Promise<boolean> => {
    try {
      await api.get('/auth/check-email', { params: { email } });
      // If valid email found, backend returns userDTO
      return true;
    } catch (error: unknown) {
      const errorResponse = error as { response?: { status?: number } };
      if (errorResponse.response) {
        if (errorResponse.response.status === HttpStatusCode.Conflict) {
          // User already registered
          throw new Error('UserAlreadyRegistered');
        } else if (errorResponse.response.status === HttpStatusCode.NotFound) {
          // Email not found in university database
          throw new Error('EmailNotFound');
        }
      }
      throw new Error('Unknown error during email check');
    }
  },

  verifyCode: async (email: string, code:string): Promise<User | null> => {
    try {
      const response = await api.get('/auth/verify-code', { params: { email,code } });
      // If valid email found, backend returns userDTO
      return response.data as UserSignUpDTO;
    } catch (error: unknown) {
      throw new Error('Invalid Verification Code');
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
    } catch (error: unknown) {
      const errorResponse = error as { response?: { data?: { error?: string } } };
      throw new Error(errorResponse.response?.data?.error || 'Sign up failed');
    }
  },

  signOut: async (): Promise<void> => {
    try {
      // Call backend logout endpoint to clear the cookie
      await api.post('/auth/sign-out');
    } catch (error: unknown) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      throw new Error(errorResponse.response?.data?.message || 'Sign Out failed');
    }
  },
};

export default authService;