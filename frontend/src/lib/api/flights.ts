/**
 * Flights API Service
 * Handles flight management and search operations
 */

import { apiRequest } from './base';
import { Flight } from '../types';

// Flight interfaces
export interface CreateFlightRequest {
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  duration: number;
  companyId: string;
  economyPrice: number;
  economySeats: number;
  comfortPrice?: number;
  comfortSeats?: number;
  businessPrice?: number;
  businessSeats?: number;
  isActive?: boolean;
}

export interface UpdateFlightRequest {
  flightNumber?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  arrivalDate?: string;
  duration?: number;
  economyPrice?: number;
  economySeats?: number;
  comfortPrice?: number;
  comfortSeats?: number;
  businessPrice?: number;
  businessSeats?: number;
  isActive?: boolean;
}

export interface FlightSearchParams {
  origin?: string;
  destination?: string;
  departureDate?: string;
}

export interface FlightResponse {
  flight: Flight;
}

export interface FlightsResponse {
  flights: Flight[];
}

/**
 * Flights API service
 */
export const flightsApi = {
  /**
   * Get all flights
   */
  async getAll(): Promise<Flight[]> {
    try {
      const response = await apiRequest<Flight[]>('/flights');
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch flights');
      }
      throw new Error('An unexpected error occurred while fetching flights');
    }
  },

  /**
   * Get flight by ID
   */
  async getById(id: string): Promise<Flight> {
    try {
      const response = await apiRequest<Flight>(`/flights/${id}`);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Flight not found');
        }
        throw new Error(error.message || 'Failed to fetch flight');
      }
      throw new Error('An unexpected error occurred while fetching flight');
    }
  },

  /**
   * Search flights
   */
  async search(params: FlightSearchParams): Promise<Flight[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.origin) queryParams.append('origin', params.origin);
      if (params.destination) queryParams.append('destination', params.destination);
      if (params.departureDate) queryParams.append('departureDate', params.departureDate);
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/flights?${queryString}` : '/flights';
      
      const response = await apiRequest<Flight[]>(endpoint);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to search flights');
      }
      throw new Error('An unexpected error occurred while searching flights');
    }
  },

  /**
   * Create new flight
   */
  async create(flightData: CreateFlightRequest): Promise<Flight> {
    try {
      const response = await apiRequest<Flight>('/flights', flightData);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          throw new Error('Flight with this number already exists for this company');
        }
        throw new Error(error.message || 'Failed to create flight');
      }
      throw new Error('An unexpected error occurred while creating flight');
    }
  },

  /**
   * Update flight
   */
  async update(id: string, flightData: UpdateFlightRequest): Promise<Flight> {
    try {
      const response = await apiClient.patch<Flight>(`/flights/${id}`, flightData);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Flight not found');
        }
        if (error.status === 409) {
          throw new Error('Flight with this number already exists for this company');
        }
        throw new Error(error.message || 'Failed to update flight');
      }
      throw new Error('An unexpected error occurred while updating flight');
    }
  },

  /**
   * Delete flight
   */
  async delete(id: string): Promise<void> {
    try {
      await apiRequest(`/flights/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Flight not found');
        }
        throw new Error(error.message || 'Failed to delete flight');
      }
      throw new Error('An unexpected error occurred while deleting flight');
    }
  },

  /**
   * Get flights by company ID
   */
  async getByCompanyId(companyId: string): Promise<Flight[]> {
    try {
      const flights = await this.getAll();
      return flights.filter(flight => flight.companyId === companyId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch company flights');
      }
      throw new Error('An unexpected error occurred while fetching company flights');
    }
  },

  /**
   * Get featured flights (active flights)
   */
  async getFeatured(): Promise<Flight[]> {
    try {
      const flights = await this.getAll();
      return flights.filter(flight => flight.isActive !== false);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch featured flights');
      }
      throw new Error('An unexpected error occurred while fetching featured flights');
    }
  }
};
