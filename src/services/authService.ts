// src/services/authService.ts
import { PasswordResetRequest, UserSignUpDTO } from '@/types/auth';
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

  verifyCode: async (email: string, code: string): Promise<User | null> => {
    try {
      const response = await api.get('/auth/verify-code', { params: { email, code } });
      // If valid email found, backend returns userDTO
      console.log(response.data);
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



  // Method to request password reset (forgot password)
  requestResetPasswordOTP: async (email: string): Promise<string> => {
    try {
      const response = await api.get('/auth/reset-password/send-code', {
        params: { email }
      });
      return response.data; // "Reset OTP sent to your email."
    } catch (error: unknown) {
      const errorResponse = error as { response?: { status?: number; data?: string } };
      if (errorResponse.response) {
        if (errorResponse.response.status === HttpStatusCode.NotFound) {
          throw new Error('Email not found in our system.');
        } else if (errorResponse.response.data) {
          throw new Error(errorResponse.response.data);
        }
      }
      throw new Error('Failed to send reset email. Please try again.');
    }
  },

  verifyResetPasswordCode: async (email: string, code: string): Promise<boolean | null> => {
    try {
      const response = await api.get('/auth/verify-password-reset-code', { params: { email, code } });
      console.log(response.status);
      return true;
    } catch (error: unknown) {
      throw new Error('Invalid Verification Code');
    }
  },



  // Method to reset password with token
  resetPassword: async (email: string, newPassword: string): Promise<string> => {
    try {
      const requestBody: PasswordResetRequest = {
        email: email,
        newPassword: newPassword
      };

      const response = await api.post('/auth/reset-password', requestBody);
      return response.data; // "Password reset successful."
    } catch (error: unknown) {
      const errorResponse = error as { response?: { status?: number; data?: string } };
      if (errorResponse.response) {
        if (errorResponse.response.status === HttpStatusCode.BadRequest) {
          // Token expired, invalid, or other validation errors
          const errorMessage = errorResponse.response.data;
          if (errorMessage?.includes('expired')) {
            throw new Error('Reset token has expired. Please request a new password reset link.');
          } else if (errorMessage?.includes('invalid')) {
            throw new Error('Invalid reset token. Please request a new password reset link.');
          } else {
            throw new Error(errorMessage || 'Invalid request. Please check your input.');
          }
        } else if (errorResponse.response.data) {
          throw new Error(errorResponse.response.data);
        }
      }
      throw new Error('Failed to reset password. Please try again.');
    }
  }
};

export default authService;