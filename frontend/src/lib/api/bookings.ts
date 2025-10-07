/**
 * Bookings API Service
 * Handles booking management operations
 */

import { apiClient, ApiError } from './apiClient';
import { Banner, Booking, Company, Flight, Gallery, User, normalizeId } from './base';

// Booking interfaces
export interface CreateBookingRequest {
  userId: string;
  flightId: string;
  passengerName: string;
  passengerEmail: string;
  seatClass: 'economy' | 'comfort' | 'business';
  price: number;
}

export interface UpdateBookingRequest {
  passengerName?: string;
  passengerEmail?: string;
  seatClass?: 'economy' | 'comfort' | 'business';
  price?: number;
  status?: 'confirmed' | 'cancelled' | 'refunded';
}

export interface BookingResponse {
  booking: Booking;
}

export interface BookingsResponse {
  bookings: Booking[];
}

/**
 * Bookings API service
 */
export const bookingsApi = {
  /**
   * Get all bookings
   */
  async getAll(): Promise<Booking[]> {
    try {
      const response = await apiClient.get<Booking[]>('/bookings');
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Get booking by ID
   */
  async getById(id: string): Promise<Booking> {
    try {
      const response = await apiClient.get<Booking>(`/bookings/${id}`);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(error.message || 'Failed to fetch booking');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Get booking by confirmation ID
   */
  async getByConfirmationId(confirmationId: string): Promise<Booking> {
    try {
      const response = await apiClient.get<Booking>(`/bookings/confirmation/${confirmationId}`);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(error.message || 'Failed to fetch booking');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Get bookings by user ID
   */
  async getByUserId(userId: string): Promise<Booking[]> {
    try {
      const response = await apiClient.get<Booking[]>(`/bookings/user/${userId}`);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Create new booking
   */
  async create(bookingData: CreateBookingRequest): Promise<Booking> {
    try {
      const response = await apiClient.post<Booking>('/bookings', bookingData);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          throw new Error('Invalid booking data provided');
        }
        if (error.status === 404) {
          throw new Error('Flight or user not found');
        }
        throw new Error(error.message || 'Failed to create booking');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Update booking
   */
  async update(id: string, bookingData: UpdateBookingRequest): Promise<Booking> {
    try {
      const response = await apiClient.patch<Booking>(`/bookings/${id}`, bookingData);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(error.message || 'Failed to update booking');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Cancel booking
   */
  async cancel(id: string): Promise<Booking> {
    try {
      const response = await apiClient.patch<Booking>(`/bookings/${id}/cancel`);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Booking not found');
        }
        if (error.status === 400) {
          throw new Error('Booking cannot be cancelled');
        }
        throw new Error(error.message || 'Failed to cancel booking');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Delete booking
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.get(`/bookings/${id}`);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(error.message || 'Failed to delete booking');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Get user's booking history
   */
  async getUserHistory(userId: string): Promise<Booking[]> {
    try {
      const bookings = await this.getByUserId(userId);
      return bookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }
};
