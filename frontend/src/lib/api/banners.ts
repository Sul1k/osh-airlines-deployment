/**
 * Banners API Service
 * Handles banner management operations
 */

import { apiRequest } from './base';
import { Banner } from '../types';

// Banner interfaces
export interface CreateBannerRequest {
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  duration: number;
  active?: boolean;
  type: 'promotion' | 'advertisement';
}

export interface UpdateBannerRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  duration?: number;
  active?: boolean;
  type?: 'promotion' | 'advertisement';
}

export interface BannerResponse {
  banner: Banner;
}

export interface BannersResponse {
  banners: Banner[];
}

/**
 * Banners API service
 */
export const bannersApi = {
  /**
   * Get all banners
   */
  async getAll(): Promise<Banner[]> {
    try {
      const response = await apiRequest<Banner[]>('/banners');
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch banners');
      }
      throw new Error('An unexpected error occurred while fetching banners');
    }
  },

  /**
   * Get banner by ID
   */
  async getById(id: string): Promise<Banner> {
    try {
      const response = await apiRequest<Banner>(`/banners/${id}`);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Banner not found');
        }
        throw new Error(error.message || 'Failed to fetch banner');
      }
      throw new Error('An unexpected error occurred while fetching banner');
    }
  },

  /**
   * Create new banner
   */
  async create(bannerData: CreateBannerRequest): Promise<Banner> {
    try {
      const response = await apiRequest<Banner>('/banners', bannerData);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to create banner');
      }
      throw new Error('An unexpected error occurred while creating banner');
    }
  },

  /**
   * Update banner
   */
  async update(id: string, bannerData: UpdateBannerRequest): Promise<Banner> {
    try {
      const response = await apiClient.patch<Banner>(`/banners/${id}`, bannerData);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Banner not found');
        }
        throw new Error(error.message || 'Failed to update banner');
      }
      throw new Error('An unexpected error occurred while updating banner');
    }
  },

  /**
   * Delete banner
   */
  async delete(id: string): Promise<void> {
    try {
      await apiRequest(`/banners/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Banner not found');
        }
        throw new Error(error.message || 'Failed to delete banner');
      }
      throw new Error('An unexpected error occurred while deleting banner');
    }
  },

  /**
   * Get active banners
   */
  async getActive(): Promise<Banner[]> {
    try {
      const banners = await this.getAll();
      return banners.filter(banner => banner.active !== false);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch active banners');
      }
      throw new Error('An unexpected error occurred while fetching active banners');
    }
  },

  /**
   * Get banners by type
   */
  async getByType(type: 'promotion' | 'advertisement'): Promise<Banner[]> {
    try {
      const banners = await this.getAll();
      return banners.filter(banner => banner.type === type);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch banners by type');
      }
      throw new Error('An unexpected error occurred while fetching banners by type');
    }
  },

  /**
   * Activate banner
   */
  async activate(id: string): Promise<Banner> {
    try {
      const response = await apiClient.patch<Banner>(`/banners/${id}`, { active: true });
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Banner not found');
        }
        throw new Error(error.message || 'Failed to activate banner');
      }
      throw new Error('An unexpected error occurred while activating banner');
    }
  },

  /**
   * Deactivate banner
   */
  async deactivate(id: string): Promise<Banner> {
    try {
      const response = await apiClient.patch<Banner>(`/banners/${id}`, { active: false });
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Banner not found');
        }
        throw new Error(error.message || 'Failed to deactivate banner');
      }
      throw new Error('An unexpected error occurred while deactivating banner');
    }
  }
};
