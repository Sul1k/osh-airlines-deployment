import { apiClient } from './apiClient';
import { Flight, Booking, Company, User, Banner, Gallery, normalizeId } from './base';

export interface FlightSearchParams {
  origin?: string;
  destination?: string;
  departureDate?: string;
}

export interface CreateFlightData {
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

export interface CreateBookingData {
  userId: string;
  flightId: string;
  passengerName: string;
  passengerEmail: string;
  seatClass: 'economy' | 'comfort' | 'business';
  price: number;
}

export interface CreateCompanyData {
  name: string;
  code: string;
  managerId: string;
  isActive?: boolean;
}

export interface CreateBannerData {
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  duration: number;
  active?: boolean;
  type: 'promotion' | 'advertisement';
}

export interface CreateGalleryData {
  title: string;
  description: string;
  imageUrl: string;
  active?: boolean;
  category: 'aircraft' | 'destination' | 'service' | 'event';
}

// Flights API
export const flightsApi = {
  // Get all flights
  getAll: async (): Promise<Flight[]> => {
    const response = await apiClient.get<Flight[]>('/flights');
    return normalizeId(response);
  },

  // Search flights
  search: async (params: FlightSearchParams): Promise<Flight[]> => {
    const queryParams = new URLSearchParams();
    if (params.origin) queryParams.append('origin', params.origin);
    if (params.destination) queryParams.append('destination', params.destination);
    if (params.departureDate) queryParams.append('departureDate', params.departureDate);
    
    const response = await apiClient.get<Flight[]>(`/flights?${queryParams.toString()}`);
    return normalizeId(response);
  },

  // Get flight by ID
  getById: async (id: string): Promise<Flight> => {
    const response = await apiClient.get<Flight>(`/flights/${id}`);
    return normalizeId(response);
  },

    // Create new flight
    create: async (flightData: CreateFlightData): Promise<Flight> => {
      const response = await apiClient.post<Flight>('/flights', flightData);
      return normalizeId(response);
    },

  // Update flight
  update: async (id: string, flightData: Partial<CreateFlightData>): Promise<Flight> => {
    const response = await apiClient.get<Flight>(`/flights/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(flightData),
    });
    return normalizeId(response);
  },

  // Delete flight
  delete: async (id: string): Promise<void> => {
    await apiClient.get(`/flights/${id}`, {
      method: 'DELETE',
    });
  },
};

// Bookings API
export const bookingsApi = {
  // Get all bookings
  getAll: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>('/bookings');
    return normalizeId(response);
  },

  // Get booking by ID
  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/bookings/${id}`);
    return normalizeId(response);
  },

  // Get bookings by user ID
  getByUserId: async (userId: string): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>(`/bookings/user/${userId}`);
    return normalizeId(response);
  },

  // Get booking by confirmation ID
  getByConfirmationId: async (confirmationId: string): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/bookings/confirmation/${confirmationId}`);
    return normalizeId(response);
  },

  // Create new booking
  create: async (bookingData: CreateBookingData): Promise<Booking> => {
    const response = await apiClient.get<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
    return normalizeId(response);
  },

  // Update booking
  update: async (id: string, bookingData: Partial<CreateBookingData>): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(bookingData),
    });
    return normalizeId(response);
  },

  // Cancel booking
  cancel: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/bookings/${id}/cancel`, {
      method: 'PATCH',
    });
    return normalizeId(response);
  },

  // Delete booking
  delete: async (id: string): Promise<void> => {
    await apiClient.get(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },
};

// Companies API
export const companiesApi = {
  // Get all companies
  getAll: async (): Promise<Company[]> => {
    const response = await apiClient.get<Company[]>('/companies');
    return normalizeId(response);
  },

  // Get company by ID
  getById: async (id: string): Promise<Company> => {
    const response = await apiClient.get<Company>(`/companies/${id}`);
    return normalizeId(response);
  },

  // Create new company
  create: async (companyData: CreateCompanyData): Promise<Company> => {
    const response = await apiClient.get<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
    return normalizeId(response);
  },

  // Update company
  update: async (id: string, companyData: Partial<CreateCompanyData>): Promise<Company> => {
    const response = await apiClient.get<Company>(`/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(companyData),
    });
    return normalizeId(response);
  },

  // Delete company
  delete: async (id: string): Promise<void> => {
    await apiClient.get(`/companies/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users API
export const usersApi = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return normalizeId(response);
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return normalizeId(response);
  },

  // Create new user
  create: async (userData: any): Promise<User> => {
    const response = await apiClient.get<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return normalizeId(response);
  },

  // Update user
  update: async (id: string, userData: any): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
    return normalizeId(response);
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    await apiClient.get(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Banners API
export const bannersApi = {
  // Get all banners
  getAll: async (): Promise<Banner[]> => {
    const response = await apiClient.get<Banner[]>('/banners');
    return normalizeId(response);
  },

  // Get banner by ID
  getById: async (id: string): Promise<Banner> => {
    const response = await apiClient.get<Banner>(`/banners/${id}`);
    return normalizeId(response);
  },

  // Create new banner
  create: async (bannerData: CreateBannerData): Promise<Banner> => {
    const response = await apiClient.get<Banner>('/banners', {
      method: 'POST',
      body: JSON.stringify(bannerData),
    });
    return normalizeId(response);
  },

  // Update banner
  update: async (id: string, bannerData: Partial<CreateBannerData>): Promise<Banner> => {
    const response = await apiClient.get<Banner>(`/banners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(bannerData),
    });
    return normalizeId(response);
  },

  // Delete banner
  delete: async (id: string): Promise<void> => {
    await apiClient.get(`/banners/${id}`, {
      method: 'DELETE',
    });
  },
};

// Gallery API
export const galleryApi = {
  // Get all gallery items
  getAll: async (category?: string): Promise<Gallery[]> => {
    const endpoint = category ? `/gallery?category=${category}` : '/gallery';
    const response = await apiClient.get<Gallery[]>(endpoint);
    return normalizeId(response);
  },

  // Get gallery item by ID
  getById: async (id: string): Promise<Gallery> => {
    const response = await apiClient.get<Gallery>(`/gallery/${id}`);
    return normalizeId(response);
  },

  // Create new gallery item
  create: async (galleryData: CreateGalleryData): Promise<Gallery> => {
    const response = await apiClient.get<Gallery>('/gallery', {
      method: 'POST',
      body: JSON.stringify(galleryData),
    });
    return normalizeId(response);
  },

  // Update gallery item
  update: async (id: string, galleryData: Partial<CreateGalleryData>): Promise<Gallery> => {
    const response = await apiClient.get<Gallery>(`/gallery/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(galleryData),
    });
    return normalizeId(response);
  },

  // Delete gallery item
  delete: async (id: string): Promise<void> => {
    await apiClient.get(`/gallery/${id}`, {
      method: 'DELETE',
    });
  },
};
