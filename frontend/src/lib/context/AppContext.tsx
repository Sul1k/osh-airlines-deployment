import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Flight, Booking, Company, Banner, GalleryImage } from '../types';
import { authApi, flightsApi, bookingsApi, companiesApi, usersApi, bannersApi, galleryApi } from '../api';
import { useToast } from '../../hooks/useToast';

interface AppContextType {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id'>, showSuccessMessage?: boolean) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  changePassword: (id: string, currentPassword: string, newPassword: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  blockUser: (id: string) => Promise<void>;
  unblockUser: (id: string) => Promise<void>;
  loadUsers: () => Promise<void>;
  
  // Flights
  flights: Flight[];
  addFlight: (flight: Omit<Flight, 'id'>) => Promise<void>;
  updateFlight: (id: string, updates: Partial<Flight>) => Promise<void>;
  deleteFlight: (id: string) => Promise<void>;
  loadFlights: () => Promise<void>;
  searchFlights: (params: { origin?: string; destination?: string; departureDate?: string }) => Promise<void>;
  
  // Bookings
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'confirmationId' | 'bookingDate' | 'status'>) => Promise<string>;
  cancelBooking: (id: string) => Promise<void>;
  loadBookings: () => Promise<void>;
  loadUserBookings: (userId: string) => Promise<void>;
  
  // Companies
  companies: Company[];
  addCompany: (company: Omit<Company, 'id'>) => Promise<void>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  loadCompanies: () => Promise<void>;
  
  // Banners
  banners: Banner[];
  addBanner: (banner: Omit<Banner, 'id'>) => Promise<void>;
  updateBanner: (id: string, updates: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  loadBanners: () => Promise<void>;
  
  // Gallery
  gallery: GalleryImage[];
  addGalleryImage: (image: Omit<GalleryImage, 'id'>) => Promise<void>;
  deleteGalleryImage: (id: string) => Promise<void>;
  loadGallery: () => Promise<void>;
  
  // Loading states
  loading: {
    users: boolean;
    flights: boolean;
    bookings: boolean;
    companies: boolean;
    banners: boolean;
    gallery: boolean;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState({
    users: false,
    flights: false,
    bookings: false,
    companies: false,
    banners: false,
    gallery: false,
  });

  const { error: showError, success: showSuccess } = useToast();

  // Booking management functions
  const loadBookings = useCallback(async (): Promise<void> => {
    setLoading(prev => ({ ...prev, bookings: true }));
    try {
      const bookingsData = await bookingsApi.getAll();
      setBookings(bookingsData);
    } catch (error: any) {
      showError(error.message || 'Failed to load bookings');
    } finally {
      setLoading(prev => ({ ...prev, bookings: false }));
    }
  }, [showError]);

  const loadUserBookings = async (userId: string): Promise<void> => {
    setLoading(prev => ({ ...prev, bookings: true }));
    try {
      const bookingsData = await bookingsApi.getByUserId(userId);
      // Replace all bookings with user's bookings only
      setBookings(bookingsData);
    } catch (error: any) {
      showError(error.message || 'Failed to load user bookings');
    } finally {
      setLoading(prev => ({ ...prev, bookings: false }));
    }
  };

  // Load user from localStorage on mount and verify with backend
  useEffect(() => {
    const initializeAuth = async () => {
    try {
      const savedUser = localStorage.getItem('osh-user');
        const token = localStorage.getItem('jwt_token');
        
        if (savedUser && token) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
          
          // Verify token is still valid by getting profile
          try {
            const profile = await authApi.getProfile();
            setCurrentUser(profile.user);
            localStorage.setItem('osh-user', JSON.stringify(profile.user));
            
            // Load user's bookings after successful authentication
            await loadUserBookings(profile.user.id);
          } catch (error) {
            // Token is invalid, clear auth data
            authApi.logout();
            setCurrentUser(null);
          }
      }
    } catch (error) {
        console.error('Error initializing auth:', error);
        authApi.logout();
        setCurrentUser(null);
    }
    };

    initializeAuth();
  }, [loadUserBookings]);

  // Authentication functions
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password });
      setCurrentUser(response.user);
      localStorage.setItem('osh-user', JSON.stringify(response.user));
      
      // Load user's bookings after successful login
      await loadUserBookings(response.user.id);
      
      showSuccess('Login successful!');
      return true;
    } catch (error: any) {
      showError(error.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    authApi.logout();
    setCurrentUser(null);
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await authApi.register({ email, password, name, role: 'user' });
      setCurrentUser(response.user);
      localStorage.setItem('osh-user', JSON.stringify(response.user));
      
      // Load user's bookings after successful registration
      await loadUserBookings(response.user.id);
      
      showSuccess('Registration successful!');
      return true;
    } catch (error: any) {
      showError(error.message || 'Registration failed');
      return false;
    }
  };

  // User management functions
  const loadUsers = async (): Promise<void> => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const usersData = await usersApi.getAll();
      setUsers(usersData);
    } catch (error: any) {
      showError(error.message || 'Failed to load users');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const addUser = async (user: Omit<User, 'id'>, showSuccessMessage: boolean = true): Promise<User> => {
    try {
      const newUser = await usersApi.create(user);
      setUsers(prev => [...prev, newUser]);
      if (showSuccessMessage) {
        showSuccess('User created successfully!');
      }
      return newUser;
    } catch (error: any) {
      showError(error.message || 'Failed to create user');
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>, showSuccessMessage: boolean = true): Promise<void> => {
    try {
      const updatedUser = await usersApi.update(id, updates);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      if (showSuccessMessage) {
        showSuccess('User updated successfully!');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to update user');
      throw error;
    }
  };

  const changePassword = async (id: string, currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await usersApi.changePassword(id, { currentPassword, newPassword });
      showSuccess('Password changed successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to change password');
      throw error;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    try {
      await usersApi.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showSuccess('User deleted successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to delete user');
      throw error;
    }
  };

  const blockUser = async (id: string): Promise<void> => {
    try {
      await updateUser(id, { isActive: false }, false);
    } catch (error) {
      // Error already handled in updateUser
    }
  };

  const unblockUser = async (id: string): Promise<void> => {
    try {
      await updateUser(id, { isActive: true }, false);
    } catch (error) {
      // Error already handled in updateUser
    }
  };

  // Flight management functions
  const loadFlights = useCallback(async (): Promise<void> => {
    setLoading(prev => ({ ...prev, flights: true }));
    try {
      const flightsData = await flightsApi.getAll();
      setFlights(flightsData);
    } catch (error: any) {
      showError(error.message || 'Failed to load flights');
    } finally {
      setLoading(prev => ({ ...prev, flights: false }));
    }
  }, [showError]);

  const searchFlights = async (params: { origin?: string; destination?: string; departureDate?: string }): Promise<void> => {
    setLoading(prev => ({ ...prev, flights: true }));
    try {
      const flightsData = await flightsApi.search(params);
      setFlights(flightsData);
    } catch (error: any) {
      showError(error.message || 'Failed to search flights');
    } finally {
      setLoading(prev => ({ ...prev, flights: false }));
    }
  };

  const addFlight = async (flight: Omit<Flight, 'id'>): Promise<void> => {
    try {
      const newFlight = await flightsApi.create(flight);
      setFlights(prev => [...prev, newFlight]);
      showSuccess('Flight created successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to create flight');
      throw error;
    }
  };

  const updateFlight = async (id: string, updates: Partial<Flight>): Promise<void> => {
    try {
      const updatedFlight = await flightsApi.update(id, updates);
      setFlights(prev => prev.map(f => f.id === id ? updatedFlight : f));
      showSuccess('Flight updated successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to update flight');
      throw error;
    }
  };

  const deleteFlight = async (id: string): Promise<void> => {
    try {
      await flightsApi.delete(id);
      setFlights(prev => prev.filter(f => f.id !== id));
      showSuccess('Flight deleted successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to delete flight');
      throw error;
    }
  };

  // Booking management functions

  const addBooking = async (booking: Omit<Booking, 'id' | 'confirmationId' | 'bookingDate' | 'status'>): Promise<string> => {
    try {
      const newBooking = await bookingsApi.create(booking);
      // Refresh user's bookings after creating a new one
      if (currentUser) {
        await loadUserBookings(currentUser.id);
      }
      showSuccess('Booking created successfully!');
      return newBooking.confirmationId;
    } catch (error: any) {
      showError(error.message || 'Failed to create booking');
      throw error;
    }
  };

  const cancelBooking = async (id: string): Promise<void> => {
    try {
      await bookingsApi.cancel(id);
      // Refresh user's bookings after cancellation
      if (currentUser) {
        await loadUserBookings(currentUser.id);
      }
      showSuccess('Booking cancelled successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to cancel booking');
      throw error;
    }
  };

  // Company management functions
  const loadCompanies = useCallback(async (): Promise<void> => {
    setLoading(prev => ({ ...prev, companies: true }));
    try {
      const companiesData = await companiesApi.getAll();
      setCompanies(companiesData);
    } catch (error: any) {
      showError(error.message || 'Failed to load companies');
    } finally {
      setLoading(prev => ({ ...prev, companies: false }));
    }
  }, [showError]);

  const addCompany = async (company: Omit<Company, 'id'>): Promise<void> => {
    try {
      const newCompany = await companiesApi.create(company);
      setCompanies(prev => [...prev, newCompany]);
      showSuccess('Company created successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to create company');
      throw error;
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>): Promise<void> => {
    try {
      const updatedCompany = await companiesApi.update(id, updates);
      setCompanies(prev => prev.map(c => c.id === id ? updatedCompany : c));
      showSuccess('Company updated successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to update company');
      throw error;
    }
  };

  const deleteCompany = async (id: string): Promise<void> => {
    try {
      await companiesApi.delete(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      showSuccess('Company deleted successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to delete company');
      throw error;
    }
  };

  // Banner management functions
  const loadBanners = useCallback(async (): Promise<void> => {
    setLoading(prev => ({ ...prev, banners: true }));
    try {
      const bannersData = await bannersApi.getAll();
      setBanners(bannersData);
    } catch (error: any) {
      showError(error.message || 'Failed to load banners');
    } finally {
      setLoading(prev => ({ ...prev, banners: false }));
    }
  }, [showError]);

  const addBanner = async (banner: Omit<Banner, 'id'>): Promise<void> => {
    try {
      const newBanner = await bannersApi.create(banner);
      setBanners(prev => [...prev, newBanner]);
      showSuccess('Banner created successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to create banner');
      throw error;
    }
  };

  const updateBanner = async (id: string, updates: Partial<Banner>): Promise<void> => {
    try {
      const updatedBanner = await bannersApi.update(id, updates);
      setBanners(prev => prev.map(b => b.id === id ? updatedBanner : b));
      showSuccess('Banner updated successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to update banner');
      throw error;
    }
  };

  const deleteBanner = async (id: string): Promise<void> => {
    try {
      await bannersApi.delete(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      showSuccess('Banner deleted successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to delete banner');
      throw error;
    }
  };

  // Gallery management functions
  const loadGallery = useCallback(async (): Promise<void> => {
    setLoading(prev => ({ ...prev, gallery: true }));
    try {
      const galleryData = await galleryApi.getAll();
      setGallery(galleryData);
    } catch (error: any) {
      showError(error.message || 'Failed to load gallery');
    } finally {
      setLoading(prev => ({ ...prev, gallery: false }));
    }
  }, [showError]);

  const addGalleryImage = useCallback(async (image: Omit<GalleryImage, 'id'>): Promise<void> => {
    try {
      const newImage = await galleryApi.create(image);
      setGallery(prev => [...prev, newImage]);
      showSuccess('Gallery image added successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to add gallery image');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteGalleryImage = useCallback(async (id: string): Promise<void> => {
    try {
      await galleryApi.delete(id);
      setGallery(prev => prev.filter(g => g.id !== id));
      showSuccess('Gallery image deleted successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to delete gallery image');
      throw error;
    }
  }, [showSuccess, showError]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        register,
        users,
        addUser,
        updateUser,
        changePassword,
        deleteUser,
        blockUser,
        unblockUser,
        loadUsers,
        flights,
        addFlight,
        updateFlight,
        deleteFlight,
        loadFlights,
        searchFlights,
        bookings,
        addBooking,
        cancelBooking,
        loadBookings,
        loadUserBookings,
        companies,
        addCompany,
        updateCompany,
        deleteCompany,
        loadCompanies,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        loadBanners,
        gallery,
        addGalleryImage,
        deleteGalleryImage,
        loadGallery,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
