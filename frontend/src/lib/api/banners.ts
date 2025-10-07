/**
 * Banners API Service
 * Handles banner management operations
 */

import { apiClient, ApiError } from './apiClient';
import { Banner, normalizeId } from './base';

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
      const response = await apiClient.get<Banner[]>('/banners');
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Get banner by ID
   */
  async getById(id: string): Promise<Banner> {
    try {
      const response = await apiClient.get<Banner>(`/banners/${id}`);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Banner not found');
        }
        throw new Error(error.message || 'Failed to fetch banner');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Create new banner
   */
  async create(bannerData: CreateBannerRequest): Promise<Banner> {
    try {
      const response = await apiClient.post<Banner>('/banners', bannerData);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Update banner
   */
  async update(id: string, bannerData: UpdateBannerRequest): Promise<Banner> {
    try {
      const response = await apiClient.patch<Banner>(`/banners/${id}`, bannerData);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Banner not found');
        }
        throw new Error(error.message || 'Failed to update banner');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Delete banner
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/banners/${id}`);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Banner not found');
        }
        throw new Error(error.message || 'Failed to delete banner');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Get active banners
   */
  async getActive(): Promise<Banner[]> {
    try {
      const banners = await this.getAll();
      return banners.filter(banner => banner.active !== false);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Get banners by type
   */
  async getByType(type: 'promotion' | 'advertisement'): Promise<Banner[]> {
    try {
      const banners = await this.getAll();
      return banners.filter(banner => banner.type === type);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Activate banner
   */
  async activate(id: string): Promise<Banner> {
    try {
      const response = await apiClient.patch<Banner>(`/banners/${id}`, { active: true });
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Banner not found');
        }
        throw new Error(error.message || 'Failed to activate banner');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Deactivate banner
   */
  async deactivate(id: string): Promise<Banner> {
    try {
      const response = await apiClient.patch<Banner>(`/banners/${id}`, { active: false });
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Banner not found');
        }
        throw new Error(error.message || 'Failed to deactivate banner');
      }
      throw new Error('An unexpected error occurred');
    }
  }
};
