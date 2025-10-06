/**
 * Bookings API Service
 * Handles booking management operations
 */

import { apiRequest } from './base';
import { Booking } from '../types';

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
      const response = await apiRequest<Booking[]>('/bookings');
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch bookings');
      }
      throw new Error('An unexpected error occurred while fetching bookings');
    }
  },

  /**
   * Get booking by ID
   */
  async getById(id: string): Promise<Booking> {
    try {
      const response = await apiRequest<Booking>(`/bookings/${id}`);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(error.message || 'Failed to fetch booking');
      }
      throw new Error('An unexpected error occurred while fetching booking');
    }
  },

  /**
   * Get booking by confirmation ID
   */
  async getByConfirmationId(confirmationId: string): Promise<Booking> {
    try {
      const response = await apiRequest<Booking>(`/bookings/confirmation/${confirmationId}`);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(error.message || 'Failed to fetch booking');
      }
      throw new Error('An unexpected error occurred while fetching booking');
    }
  },

  /**
   * Get bookings by user ID
   */
  async getByUserId(userId: string): Promise<Booking[]> {
    try {
      const response = await apiRequest<Booking[]>(`/bookings/user/${userId}`);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch user bookings');
      }
      throw new Error('An unexpected error occurred while fetching user bookings');
    }
  },

  /**
   * Create new booking
   */
  async create(bookingData: CreateBookingRequest): Promise<Booking> {
    try {
      const response = await apiRequest<Booking>('/bookings', bookingData);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          throw new Error('Invalid booking data provided');
        }
        if (error.status === 404) {
          throw new Error('Flight or user not found');
        }
        throw new Error(error.message || 'Failed to create booking');
      }
      throw new Error('An unexpected error occurred while creating booking');
    }
  },

  /**
   * Update booking
   */
  async update(id: string, bookingData: UpdateBookingRequest): Promise<Booking> {
    try {
      const response = await apiClient.patch<Booking>(`/bookings/${id}`, bookingData);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(error.message || 'Failed to update booking');
      }
      throw new Error('An unexpected error occurred while updating booking');
    }
  },

  /**
   * Cancel booking
   */
  async cancel(id: string): Promise<Booking> {
    try {
      const response = await apiClient.patch<Booking>(`/bookings/${id}/cancel`);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Booking not found');
        }
        if (error.status === 400) {
          throw new Error('Booking cannot be cancelled');
        }
        throw new Error(error.message || 'Failed to cancel booking');
      }
      throw new Error('An unexpected error occurred while cancelling booking');
    }
  },

  /**
   * Delete booking
   */
  async delete(id: string): Promise<void> {
    try {
      await apiRequest(`/bookings/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(error.message || 'Failed to delete booking');
      }
      throw new Error('An unexpected error occurred while deleting booking');
    }
  },

  /**
   * Get user's booking history
   */
  async getUserHistory(userId: string): Promise<Booking[]> {
    try {
      const bookings = await this.getByUserId(userId);
      return bookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch booking history');
      }
      throw new Error('An unexpected error occurred while fetching booking history');
    }
  }
};
