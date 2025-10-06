// Base API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1010/api/v1';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string | string[];
  statusCode?: number;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'company_manager' | 'admin';
  isActive?: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Flight {
  _id: string;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  userId: string;
  flightId: string;
  passengerName: string;
  passengerEmail: string;
  seatClass: 'economy' | 'comfort' | 'business';
  price: number;
  confirmationId: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  refundedAt?: string;
}

export interface Company {
  _id: string;
  name: string;
  code: string;
  managerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  duration: number;
  active: boolean;
  type: 'promotion' | 'advertisement';
  createdAt: string;
  updatedAt: string;
}

export interface Gallery {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  active: boolean;
  category: 'aircraft' | 'destination' | 'service' | 'event';
  createdAt: string;
  updatedAt: string;
}

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem('jwt_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('jwt_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('jwt_token');
};

// Base fetch wrapper with error handling
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Helper to convert MongoDB _id to frontend id
export const normalizeId = (item: any): any => {
  if (!item) return item;
  
  if (Array.isArray(item)) {
    return item.map(normalizeId);
  }
  
  if (typeof item === 'object' && item._id) {
    const { _id, ...rest } = item;
    return { id: _id, ...rest };
  }
  
  return item;
};
