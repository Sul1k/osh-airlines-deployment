/**
 * Authentication API Service
 * Handles login, registration, and profile management
 */

import { apiRequest } from './base';
import { User } from '../types';

// Authentication interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'company_manager' | 'admin';
}

export interface RegisterResponse {
  access_token: string;
  user: User;
}

export interface ProfileResponse {
  user: User;
}

/**
 * Authentication API service
 */
export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      // Store token in localStorage
      if (response.access_token) {
        localStorage.setItem('osh-jwt-token', response.access_token);
      }
      
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Login failed');
      }
      throw new Error('An unexpected error occurred during login');
    }
  },

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiRequest<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      // Store token in localStorage
      if (response.access_token) {
        localStorage.setItem('osh-jwt-token', response.access_token);
      }
      
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Registration failed');
      }
      throw new Error('An unexpected error occurred during registration');
    }
  },

  /**
   * Get user profile
   */
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiRequest<ProfileResponse>('/auth/profile');
      return response;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          // Token expired or invalid
          localStorage.removeItem('osh-jwt-token');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(error.message || 'Failed to get profile');
      }
      throw new Error('An unexpected error occurred while getting profile');
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Remove token from localStorage
      localStorage.removeItem('osh-jwt-token');
      
      // Optionally call logout endpoint if backend supports it
      // await apiRequest('/auth/logout');
    } catch (error) {
      // Even if logout fails, we should clear the local token
      localStorage.removeItem('osh-jwt-token');
      console.error('Logout error:', error);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('osh-jwt-token');
    return !!token;
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('osh-jwt-token');
  }
};