/**
 * Gallery API Service
 * Handles gallery management operations
 */

import { apiClient, ApiError } from './apiClient';
import { Banner, Booking, Company, Flight, Gallery, GalleryImage, User, normalizeId } from './base';

// Gallery interfaces
export interface CreateGalleryRequest {
  title: string;
  description: string;
  imageUrl: string;
  active?: boolean;
  category: 'aircraft' | 'destination' | 'service' | 'event';
}

export interface UpdateGalleryRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  category?: 'aircraft' | 'destination' | 'service' | 'event';
}

export interface GalleryResponse {
  gallery: GalleryImage;
}

export interface GalleryListResponse {
  gallery: GalleryImage[];
}

/**
 * Gallery API service
 */
export const galleryApi = {
  /**
   * Get all gallery images
   */
  async getAll(): Promise<GalleryImage[]> {
    try {
      const response = await apiClient.get<GalleryImage[]>('/gallery');
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Get gallery image by ID
   */
  async getById(id: string): Promise<GalleryImage> {
    try {
      const response = await apiClient.get<GalleryImage>(`/gallery/${id}`);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Gallery image not found');
        }
        throw new Error(error.message || 'Failed to fetch gallery image');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Create new gallery image
   */
  async create(galleryData: CreateGalleryRequest): Promise<GalleryImage> {
    try {
      const response = await apiClient.post<GalleryImage>('/gallery', galleryData);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Update gallery image
   */
  async update(id: string, galleryData: UpdateGalleryRequest): Promise<GalleryImage> {
    try {
      const response = await apiClient.patch<GalleryImage>(`/gallery/${id}`, galleryData);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Gallery image not found');
        }
        throw new Error(error.message || 'Failed to update gallery image');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Delete gallery image
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/gallery/${id}`);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Gallery image not found');
        }
        throw new Error(error.message || 'Failed to delete gallery image');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Get gallery images by category
   */
  async getByCategory(category: 'aircraft' | 'destination' | 'service' | 'event'): Promise<GalleryImage[]> {
    try {
      const response = await apiClient.get<GalleryImage[]>(`/gallery?category=${category}`);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Get active gallery images
   */
  async getActive(): Promise<GalleryImage[]> {
    try {
      const gallery = await this.getAll();
      return gallery.filter(image => image.active !== false);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Get active gallery images by category
   */
  async getActiveByCategory(category: 'aircraft' | 'destination' | 'service' | 'event'): Promise<GalleryImage[]> {
    try {
      const gallery = await this.getByCategory(category);
      return gallery.filter(image => image.active !== false);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Activate gallery image
   */
  async activate(id: string): Promise<GalleryImage> {
    try {
      const response = await apiClient.patch<GalleryImage>(`/gallery/${id}`, { active: true });
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Gallery image not found');
        }
        throw new Error(error.message || 'Failed to activate gallery image');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Deactivate gallery image
   */
  async deactivate(id: string): Promise<GalleryImage> {
    try {
      const response = await apiClient.patch<GalleryImage>(`/gallery/${id}`, { active: false });
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Gallery image not found');
        }
        throw new Error(error.message || 'Failed to deactivate gallery image');
      }
      throw new Error('An unexpected error occurred');
    }
  }
};
