/**
 * Users API Service
 * Handles user management operations
 */

import { apiClient, ApiError } from './apiClient';
import { Banner, Booking, Company, Flight, Gallery, User, normalizeId } from './base';

// User interfaces
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'company_manager' | 'admin';
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: 'user' | 'company_manager' | 'admin';
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponse {
  user: User;
}

export interface UsersResponse {
  users: User[];
}

/**
 * Users API service
 */
export const usersApi = {
  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    try {
      const response = await apiClient.get<User[]>('/users');
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(error.message || 'Failed to fetch user');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Create new user
   */
  async create(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await apiClient.post<User>('/users', userData);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          throw new Error('User with this email already exists');
        }
        throw new Error(error.message || 'Failed to create user');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Update user
   */
  async update(id: string, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/users/${id}`, userData);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('User not found');
        }
        if (error.status === 409) {
          throw new Error('User with this email already exists');
        }
        throw new Error(error.message || 'Failed to update user');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.get(`/users/${id}`);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(error.message || 'Failed to delete user');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Block user
   */
  async block(id: string): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/users/${id}`, { isActive: false });
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(error.message || 'Failed to block user');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Unblock user
   */
  async unblock(id: string): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/users/${id}`, { isActive: true });
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(error.message || 'Failed to unblock user');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Change user password
   */
  async changePassword(id: string, passwordData: ChangePasswordRequest): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/users/${id}/change-password`, passwordData);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('User not found');
        }
        if (error.status === 400) {
          throw new Error(error.message || 'Invalid password data');
        }
        throw new Error(error.message || 'Failed to change password');
      }
      throw new Error('An unexpected error occurred');
    }
  }
};
