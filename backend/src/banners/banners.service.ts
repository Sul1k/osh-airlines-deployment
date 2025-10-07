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

    // Ensure imageUrl is complete and valid
    if (createBannerDto.imageUrl && !this.isCompleteImageUrl(createBannerDto.imageUrl)) {
      createBannerDto.imageUrl = this.getDefaultImageUrl();
    }

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
    const banners = await this.bannerModel.find().sort({ createdAt: -1 }).exec();
    
    // Fix any banners with incomplete image URLs
    for (const banner of banners) {
      if (banner.imageUrl && !this.isCompleteImageUrl(banner.imageUrl)) {
        banner.imageUrl = this.getDefaultImageUrl();
        await banner.save();
      }
    }
    
    return banners;
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

    // Ensure imageUrl is complete and valid if being updated
    if (updateBannerDto.imageUrl && !this.isCompleteImageUrl(updateBannerDto.imageUrl)) {
      updateBannerDto.imageUrl = this.getDefaultImageUrl();
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

  private isCompleteImageUrl(url: string): boolean {
    // Check if URL is complete (not truncated)
    const urlRegex = /^https?:\/\/.+\.[a-zA-Z]{2,4}(\?.*)?$/;
    return urlRegex.test(url) && !url.endsWith(':');
  }

  private getDefaultImageUrl(): string {
    // Return a default high-quality image URL
    const defaultImages = [
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&h=400&fit=crop'
    ];
    
    // Return a random default image
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  }
}
