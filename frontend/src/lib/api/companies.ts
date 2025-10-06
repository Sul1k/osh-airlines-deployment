/**
 * Companies API Service
 * Handles company management operations
 */

import { apiRequest } from './base';
import { Company } from '../types';

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
      const response = await apiRequest<Company[]>('/companies');
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch companies');
      }
      throw new Error('An unexpected error occurred while fetching companies');
    }
  },

  /**
   * Get company by ID
   */
  async getById(id: string): Promise<Company> {
    try {
      const response = await apiRequest<Company>(`/companies/${id}`);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Company not found');
        }
        throw new Error(error.message || 'Failed to fetch company');
      }
      throw new Error('An unexpected error occurred while fetching company');
    }
  },

  /**
   * Create new company
   */
  async create(companyData: CreateCompanyRequest): Promise<Company> {
    try {
      const response = await apiRequest<Company>('/companies', companyData);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          throw new Error('Company with this name or code already exists');
        }
        throw new Error(error.message || 'Failed to create company');
      }
      throw new Error('An unexpected error occurred while creating company');
    }
  },

  /**
   * Update company
   */
  async update(id: string, companyData: UpdateCompanyRequest): Promise<Company> {
    try {
      const response = await apiClient.patch<Company>(`/companies/${id}`, companyData);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Company not found');
        }
        if (error.status === 409) {
          throw new Error('Company with this name or code already exists');
        }
        throw new Error(error.message || 'Failed to update company');
      }
      throw new Error('An unexpected error occurred while updating company');
    }
  },

  /**
   * Delete company
   */
  async delete(id: string): Promise<void> {
    try {
      await apiRequest(`/companies/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Company not found');
        }
        throw new Error(error.message || 'Failed to delete company');
      }
      throw new Error('An unexpected error occurred while deleting company');
    }
  },

  /**
   * Get company by manager ID
   */
  async getByManagerId(managerId: string): Promise<Company | null> {
    try {
      const companies = await this.getAll();
      return companies.find(company => company.managerId === managerId) || null;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch company by manager');
      }
      throw new Error('An unexpected error occurred while fetching company by manager');
    }
  }
};
