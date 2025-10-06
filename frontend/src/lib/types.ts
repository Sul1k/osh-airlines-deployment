export type UserRole = 'user' | 'company_manager' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  managerId: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Flight {
  id: string;
  companyId: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  duration: number;
  economyPrice: number;
  economySeats: number;
  comfortPrice?: number;
  comfortSeats?: number;
  businessPrice?: number;
  businessSeats?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Legacy mock data properties (for backward compatibility)
  price?: {
    economy: number;
    comfort: number;
    business: number;
  };
  seats?: {
    economy: { total: number; available: number };
    comfort: { total: number; available: number };
    business: { total: number; available: number };
  };
  status?: string;
}

export interface Booking {
  id: string;
  userId: string;
  flightId: string;
  confirmationId: string;
  passengerName: string;
  passengerEmail: string;
  seatClass: 'economy' | 'comfort' | 'business';
  price: number;
  bookingDate: string;
  status: 'booked' | 'confirmed' | 'cancelled' | 'refunded';
  cancelledAt?: string;
  refundedAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  duration: number; // in seconds
  active?: boolean;
  type: 'promotion' | 'advertisement';
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  active?: boolean;
  category: 'aircraft' | 'destination' | 'service' | 'event';
  createdAt?: string;
  updatedAt?: string;
}