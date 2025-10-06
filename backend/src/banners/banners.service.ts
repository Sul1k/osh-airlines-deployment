import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from '../schemas/banner.schema';

@Injectable()
export class BannersService {
  constructor(@InjectModel(Banner.name) private bannerModel: Model<BannerDocument>) {}

  async create(createBannerDto: any): Promise<Banner> {
    // Validate banner data
    this.validateBannerData(createBannerDto);

    const banner = new this.bannerModel(createBannerDto);
    return banner.save();
  }

  private validateBannerData(bannerData: any): void {
    const requiredFields = ['title', 'description', 'imageUrl', 'duration', 'type'];
    
    for (const field of requiredFields) {
      if (!bannerData[field] || (typeof bannerData[field] === 'string' && bannerData[field].trim() === '')) {
        throw new BadRequestException(`${field} is required and cannot be empty`);
      }
    }

    // Validate duration is positive
    if (bannerData.duration <= 0) {
      throw new BadRequestException('Duration must be a positive number');
    }

    // Validate type
    const validTypes = ['promotion', 'advertisement'];
    if (!validTypes.includes(bannerData.type)) {
      throw new BadRequestException(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate title and description length
    if (bannerData.title.length < 2 || bannerData.title.length > 100) {
      throw new BadRequestException('Title must be between 2 and 100 characters');
    }

    if (bannerData.description.length < 5 || bannerData.description.length > 500) {
      throw new BadRequestException('Description must be between 5 and 500 characters');
    }

    // Validate URL format
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(bannerData.imageUrl)) {
      throw new BadRequestException('Image URL must be a valid HTTP/HTTPS URL');
    }

    // Validate link URL if provided
    if (bannerData.link && !urlRegex.test(bannerData.link)) {
      throw new BadRequestException('Link must be a valid HTTP/HTTPS URL');
    }
  }

  private validateBannerUpdateData(updateData: any): void {
    // Validate only the fields that are being updated
    if (updateData.title !== undefined) {
      if (!updateData.title || updateData.title.trim() === '') {
        throw new BadRequestException('Title cannot be empty');
      }
      if (updateData.title.length < 2 || updateData.title.length > 100) {
        throw new BadRequestException('Title must be between 2 and 100 characters');
      }
    }

    if (updateData.description !== undefined) {
      if (!updateData.description || updateData.description.trim() === '') {
        throw new BadRequestException('Description cannot be empty');
      }
      if (updateData.description.length < 5 || updateData.description.length > 500) {
        throw new BadRequestException('Description must be between 5 and 500 characters');
      }
    }

    if (updateData.imageUrl !== undefined) {
      if (!updateData.imageUrl || updateData.imageUrl.trim() === '') {
        throw new BadRequestException('Image URL cannot be empty');
      }
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(updateData.imageUrl)) {
        throw new BadRequestException('Image URL must be a valid HTTP/HTTPS URL');
      }
    }

    if (updateData.duration !== undefined) {
      if (updateData.duration <= 0) {
        throw new BadRequestException('Duration must be a positive number');
      }
    }

    if (updateData.type !== undefined) {
      const validTypes = ['promotion', 'advertisement'];
      if (!validTypes.includes(updateData.type)) {
        throw new BadRequestException(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
      }
    }

    if (updateData.link !== undefined && updateData.link) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(updateData.link)) {
        throw new BadRequestException('Link must be a valid HTTP/HTTPS URL');
      }
    }
  }

  async findAll(): Promise<Banner[]> {
    return this.bannerModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Banner> {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid banner ID format: ${id}`);
    }

    const banner = await this.bannerModel.findById(id).exec();
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return banner;
  }

  async update(id: string, updateBannerDto: any): Promise<Banner> {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid banner ID format: ${id}`);
    }

    // Validate update data if provided
    if (Object.keys(updateBannerDto).length > 0) {
      this.validateBannerUpdateData(updateBannerDto);
    }

    const banner = await this.bannerModel.findByIdAndUpdate(
      id,
      updateBannerDto,
      { new: true, runValidators: true }
    ).exec();

    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return banner;
  }

  async remove(id: string): Promise<Banner> {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid banner ID format: ${id}`);
    }

    const banner = await this.bannerModel.findByIdAndDelete(id).exec();
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return banner;
  }

  private isValidObjectId(id: string): boolean {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }
}
