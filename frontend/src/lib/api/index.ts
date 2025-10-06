/**
 * API Services Index
 * Central export for all API services
 */

// Export API client
export { apiClient, ApiClient, ApiError, getToken, setToken, removeToken, isAuthenticated, logout } from './apiClient';

// Export all API services
export { authApi } from './auth';
export { usersApi } from './users';
export { companiesApi } from './companies';
export { flightsApi } from './flights';
export { bookingsApi } from './bookings';
export { bannersApi } from './banners';
export { galleryApi } from './gallery';

// Export types
export type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ProfileResponse } from './auth';
export type { CreateUserRequest, UpdateUserRequest, UserResponse, UsersResponse } from './users';
export type { CreateCompanyRequest, UpdateCompanyRequest, CompanyResponse, CompaniesResponse } from './companies';
export type { CreateFlightRequest, UpdateFlightRequest, FlightSearchParams, FlightResponse, FlightsResponse } from './flights';
export type { CreateBookingRequest, UpdateBookingRequest, BookingResponse, BookingsResponse } from './bookings';
export type { CreateBannerRequest, UpdateBannerRequest, BannerResponse, BannersResponse } from './banners';
export type { CreateGalleryRequest, UpdateGalleryRequest, GalleryResponse, GalleryListResponse } from './gallery';