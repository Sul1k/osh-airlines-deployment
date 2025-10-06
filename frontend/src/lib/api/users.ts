/**
 * Users API Service
 * Handles user management operations
 */

import { apiRequest } from './base';
import { User } from '../types';

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
      const response = await apiRequest<User[]>('/users');
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch users');
      }
      throw new Error('An unexpected error occurred while fetching users');
    }
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    try {
      const response = await apiRequest<User>(`/users/${id}`);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(error.message || 'Failed to fetch user');
      }
      throw new Error('An unexpected error occurred while fetching user');
    }
  },

  /**
   * Create new user
   */
  async create(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await apiRequest<User>('/users', userData);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          throw new Error('User with this email already exists');
        }
        throw new Error(error.message || 'Failed to create user');
      }
      throw new Error('An unexpected error occurred while creating user');
    }
  },

  /**
   * Update user
   */
  async update(id: string, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/users/${id}`, userData);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('User not found');
        }
        if (error.status === 409) {
          throw new Error('User with this email already exists');
        }
        throw new Error(error.message || 'Failed to update user');
      }
      throw new Error('An unexpected error occurred while updating user');
    }
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    try {
      await apiRequest(`/users/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(error.message || 'Failed to delete user');
      }
      throw new Error('An unexpected error occurred while deleting user');
    }
  },

  /**
   * Block user
   */
  async block(id: string): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/users/${id}`, { isActive: false });
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(error.message || 'Failed to block user');
      }
      throw new Error('An unexpected error occurred while blocking user');
    }
  },

  /**
   * Unblock user
   */
  async unblock(id: string): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/users/${id}`, { isActive: true });
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(error.message || 'Failed to unblock user');
      }
      throw new Error('An unexpected error occurred while unblocking user');
    }
  },

  /**
   * Change user password
   */
  async changePassword(id: string, passwordData: ChangePasswordRequest): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/users/${id}/change-password`, passwordData);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('User not found');
        }
        if (error.status === 400) {
          throw new Error(error.message || 'Invalid password data');
        }
        throw new Error(error.message || 'Failed to change password');
      }
      throw new Error('An unexpected error occurred while changing password');
    }
  }
};
