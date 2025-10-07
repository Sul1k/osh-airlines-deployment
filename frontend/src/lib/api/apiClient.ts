/**
 * API Client Configuration
 * Base client for all API communications with the NestJS backend
 */

// Base configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:1010/api/v1';
const API_TIMEOUT = 10000; // 10 seconds

// Token management
const TOKEN_KEY = 'osh-jwt-token';

/**
 * Get JWT token from localStorage
 */
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token from localStorage:', error);
    return null;
  }
};

/**
 * Set JWT token in localStorage
 */
export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting token in localStorage:', error);
  }
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
};

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  statusCode?: number;
  error?: string;
}

/**
 * API Error class
 */
export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Base API client class
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 100; // Minimum 100ms between requests

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  /**
   * Create headers for API requests
   */
  private getHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // Add JWT token if available
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Normalize MongoDB _id to id for frontend consistency
   */
  private normalizeId(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.normalizeId(item));
    }

    if (typeof obj === 'object') {
      const normalized = { ...obj };
      if (normalized._id) {
        normalized.id = normalized._id;
        delete normalized._id;
      }
      
      // Recursively normalize nested objects
      for (const key in normalized) {
        if (typeof normalized[key] === 'object') {
          normalized[key] = this.normalizeId(normalized[key]);
        }
      }
      
      return normalized;
    }

    return obj;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle different response types
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle non-2xx responses
    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    // Normalize _id to id for frontend consistency
    return this.normalizeId(data);
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(customHeaders);

    // Rate limiting - prevent too many rapid requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${delay}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    this.lastRequestTime = Date.now();

    // Console logging for API calls
    console.log(`🚀 API Call: ${options.method || 'GET'} ${url}`);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      // Log response status
      console.log(`✅ API Response: ${response.status} ${response.statusText} for ${url}`);
      
      // Handle 401 errors by clearing invalid tokens
      if (response.status === 401) {
        console.warn('🚨 401 Unauthorized - clearing invalid token');
        this.removeToken();
        // Don't throw error for profile calls to prevent infinite loops
        if (endpoint.includes('/auth/profile')) {
          return { user: null } as T;
        }
      }
      
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Network error - please check your connection', 0);
      }

      throw new ApiError('An unexpected error occurred', 500, error);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, customHeaders);
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, customHeaders);
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, customHeaders);
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, customHeaders);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, customHeaders);
  }

  /**
   * Remove JWT token from localStorage
   */
  private removeToken(): void {
    removeToken();
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Export the class for testing
export { ApiClient };

// Utility functions for common operations
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const logout = (): void => {
  removeToken();
  // Redirect to login page
  window.location.href = '/login';
};