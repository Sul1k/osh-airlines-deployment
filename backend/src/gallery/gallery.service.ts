import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gallery, GalleryDocument } from '../schemas/gallery.schema';

@Injectable()
export class GalleryService {
  constructor(@InjectModel(Gallery.name) private galleryModel: Model<GalleryDocument>) {}

  async create(createGalleryDto: any): Promise<Gallery> {
    // Validate gallery data
    this.validateGalleryData(createGalleryDto);

    const gallery = new this.galleryModel(createGalleryDto);
    return gallery.save();
  }

  private validateGalleryData(galleryData: any): void {
    const requiredFields = ['title', 'description', 'imageUrl', 'category'];
    
    for (const field of requiredFields) {
      if (!galleryData[field] || (typeof galleryData[field] === 'string' && galleryData[field].trim() === '')) {
        throw new BadRequestException(`${field} is required and cannot be empty`);
      }
    }

    // Validate category
    const validCategories = ['aircraft', 'destination', 'service', 'event'];
    if (!validCategories.includes(galleryData.category)) {
      throw new BadRequestException(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    // Validate title and description length
    if (galleryData.title.length < 2 || galleryData.title.length > 100) {
      throw new BadRequestException('Title must be between 2 and 100 characters');
    }

    if (galleryData.description.length < 5 || galleryData.description.length > 500) {
      throw new BadRequestException('Description must be between 5 and 500 characters');
    }

    // Validate URL format
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(galleryData.imageUrl)) {
      throw new BadRequestException('Image URL must be a valid HTTP/HTTPS URL');
    }
  }

  private validateGalleryUpdateData(updateData: any): void {
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

    if (updateData.category !== undefined) {
      const validCategories = ['aircraft', 'destination', 'service', 'event'];
      if (!validCategories.includes(updateData.category)) {
        throw new BadRequestException(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
      }
    }
  }

  async findAll(): Promise<Gallery[]> {
    return this.galleryModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByCategory(category: string): Promise<Gallery[]> {
    const validCategories = ['aircraft', 'destination', 'service', 'event'];
    if (!validCategories.includes(category)) {
      throw new BadRequestException(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }
    return this.galleryModel.find({ category }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Gallery> {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid gallery ID format: ${id}`);
    }

    const gallery = await this.galleryModel.findById(id).exec();
    if (!gallery) {
      throw new NotFoundException(`Gallery with ID ${id} not found`);
    }
    return gallery;
  }

  async update(id: string, updateGalleryDto: any): Promise<Gallery> {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid gallery ID format: ${id}`);
    }

    // Validate update data if provided
    if (Object.keys(updateGalleryDto).length > 0) {
      this.validateGalleryUpdateData(updateGalleryDto);
    }

    const gallery = await this.galleryModel.findByIdAndUpdate(
      id,
      updateGalleryDto,
      { new: true, runValidators: true }
    ).exec();

    if (!gallery) {
      throw new NotFoundException(`Gallery with ID ${id} not found`);
    }
    return gallery;
  }

  async remove(id: string): Promise<Gallery> {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid gallery ID format: ${id}`);
    }

    const gallery = await this.galleryModel.findByIdAndDelete(id).exec();
    if (!gallery) {
      throw new NotFoundException(`Gallery with ID ${id} not found`);
    }
    return gallery;
  }

  private isValidObjectId(id: string): boolean {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }
}
