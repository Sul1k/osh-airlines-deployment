/**
 * Companies API Service
 * Handles company management operations
 */

import { apiClient, ApiError } from './apiClient';
import { Banner, Booking, Company, Flight, Gallery, User, normalizeId } from './base';

// Company interfaces
export interface CreateCompanyRequest {
  name: string;
  code: string;
  managerId: string;
  isActive?: boolean;
}

export interface UpdateCompanyRequest {
  name?: string;
  code?: string;
  managerId?: string;
  isActive?: boolean;
}

export interface CompanyResponse {
  company: Company;
}

export interface CompaniesResponse {
  companies: Company[];
}

/**
 * Companies API service
 */
export const companiesApi = {
  /**
   * Get all companies
   */
  async getAll(): Promise<Company[]> {
    try {
      const response = await apiClient.get<Company[]>('/companies');
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Get company by ID
   */
  async getById(id: string): Promise<Company> {
    try {
      const response = await apiClient.get<Company>(`/companies/${id}`);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Company not found');
        }
        throw new Error(error.message || 'Failed to fetch company');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Create new company
   */
  async create(companyData: CreateCompanyRequest): Promise<Company> {
    try {
      const response = await apiClient.post<Company>('/companies', companyData);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          throw new Error('Company with this name or code already exists');
        }
        throw new Error(error.message || 'Failed to create company');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Update company
   */
  async update(id: string, companyData: UpdateCompanyRequest): Promise<Company> {
    try {
      const response = await apiClient.patch<Company>(`/companies/${id}`, companyData);
      return normalizeId(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Company not found');
        }
        if (error.status === 409) {
          throw new Error('Company with this name or code already exists');
        }
        throw new Error(error.message || 'Failed to update company');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Delete company
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.get(`/companies/${id}`);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Company not found');
        }
        throw new Error(error.message || 'Failed to delete company');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  /**
   * Get company by manager ID
   */
  async getByManagerId(managerId: string): Promise<Company | null> {
    try {
      const companies = await this.getAll();
      return companies.find(company => company.managerId === managerId) || null;
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }
};
