import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from '../schemas/company.schema';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private companyModel: Model<CompanyDocument>) {}

  async create(createCompanyDto: any): Promise<Company> {
    // Validate company data
    this.validateCompanyData(createCompanyDto);

    // Check for duplicate company name
    const existingCompanyByName = await this.companyModel.findOne({
      name: { $regex: new RegExp(`^${createCompanyDto.name}$`, 'i') }
    });

    if (existingCompanyByName) {
      throw new ConflictException(`Company with name "${createCompanyDto.name}" already exists`);
    }

    // Check for duplicate company code
    const existingCompanyByCode = await this.companyModel.findOne({
      code: { $regex: new RegExp(`^${createCompanyDto.code}$`, 'i') }
    });

    if (existingCompanyByCode) {
      throw new ConflictException(`Company with code "${createCompanyDto.code}" already exists`);
    }

    const company = new this.companyModel(createCompanyDto);
    return company.save();
  }

  private validateCompanyData(companyData: any): void {
    const requiredFields = ['name', 'code', 'managerId'];
    
    for (const field of requiredFields) {
      if (!companyData[field] || companyData[field].trim() === '') {
        throw new BadRequestException(`${field} is required and cannot be empty`);
      }
    }

    // Validate company code format (should be 2-3 uppercase letters)
    const codeRegex = /^[A-Z]{2,3}$/;
    if (!codeRegex.test(companyData.code)) {
      throw new BadRequestException('Company code must be 2-3 uppercase letters (e.g., TJ, TJA)');
    }

    // Validate company name length
    if (companyData.name.length < 2 || companyData.name.length > 100) {
      throw new BadRequestException('Company name must be between 2 and 100 characters');
    }
  }

  async findAll(): Promise<Company[]> {
    return this.companyModel.find().exec();
  }

  async findOne(id: string): Promise<Company | null> {
    return this.companyModel.findById(id).exec();
  }

  async update(id: string, updateCompanyDto: any): Promise<Company | null> {
    return this.companyModel.findByIdAndUpdate(id, updateCompanyDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Company | null> {
    return this.companyModel.findByIdAndDelete(id).exec();
  }
}
