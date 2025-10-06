/**
 * Gallery API Service
 * Handles gallery management operations
 */

import { apiRequest } from './base';
import { GalleryImage } from '../types';

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
      const response = await apiRequest<GalleryImage[]>('/gallery');
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch gallery images');
      }
      throw new Error('An unexpected error occurred while fetching gallery images');
    }
  },

  /**
   * Get gallery image by ID
   */
  async getById(id: string): Promise<GalleryImage> {
    try {
      const response = await apiRequest<GalleryImage>(`/gallery/${id}`);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Gallery image not found');
        }
        throw new Error(error.message || 'Failed to fetch gallery image');
      }
      throw new Error('An unexpected error occurred while fetching gallery image');
    }
  },

  /**
   * Create new gallery image
   */
  async create(galleryData: CreateGalleryRequest): Promise<GalleryImage> {
    try {
      const response = await apiRequest<GalleryImage>('/gallery', galleryData);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to create gallery image');
      }
      throw new Error('An unexpected error occurred while creating gallery image');
    }
  },

  /**
   * Update gallery image
   */
  async update(id: string, galleryData: UpdateGalleryRequest): Promise<GalleryImage> {
    try {
      const response = await apiClient.patch<GalleryImage>(`/gallery/${id}`, galleryData);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Gallery image not found');
        }
        throw new Error(error.message || 'Failed to update gallery image');
      }
      throw new Error('An unexpected error occurred while updating gallery image');
    }
  },

  /**
   * Delete gallery image
   */
  async delete(id: string): Promise<void> {
    try {
      await apiRequest(`/gallery/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Gallery image not found');
        }
        throw new Error(error.message || 'Failed to delete gallery image');
      }
      throw new Error('An unexpected error occurred while deleting gallery image');
    }
  },

  /**
   * Get gallery images by category
   */
  async getByCategory(category: 'aircraft' | 'destination' | 'service' | 'event'): Promise<GalleryImage[]> {
    try {
      const response = await apiRequest<GalleryImage[]>(`/gallery?category=${category}`);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch gallery images by category');
      }
      throw new Error('An unexpected error occurred while fetching gallery images by category');
    }
  },

  /**
   * Get active gallery images
   */
  async getActive(): Promise<GalleryImage[]> {
    try {
      const gallery = await this.getAll();
      return gallery.filter(image => image.active !== false);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch active gallery images');
      }
      throw new Error('An unexpected error occurred while fetching active gallery images');
    }
  },

  /**
   * Get active gallery images by category
   */
  async getActiveByCategory(category: 'aircraft' | 'destination' | 'service' | 'event'): Promise<GalleryImage[]> {
    try {
      const gallery = await this.getByCategory(category);
      return gallery.filter(image => image.active !== false);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch active gallery images by category');
      }
      throw new Error('An unexpected error occurred while fetching active gallery images by category');
    }
  },

  /**
   * Activate gallery image
   */
  async activate(id: string): Promise<GalleryImage> {
    try {
      const response = await apiClient.patch<GalleryImage>(`/gallery/${id}`, { active: true });
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Gallery image not found');
        }
        throw new Error(error.message || 'Failed to activate gallery image');
      }
      throw new Error('An unexpected error occurred while activating gallery image');
    }
  },

  /**
   * Deactivate gallery image
   */
  async deactivate(id: string): Promise<GalleryImage> {
    try {
      const response = await apiClient.patch<GalleryImage>(`/gallery/${id}`, { active: false });
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Gallery image not found');
        }
        throw new Error(error.message || 'Failed to deactivate gallery image');
      }
      throw new Error('An unexpected error occurred while deactivating gallery image');
    }
  }
};
