import { 
  IsString, 
  IsUrl, 
  IsIn, 
  IsOptional, 
  IsBoolean,
  MinLength,
  MaxLength
} from 'class-validator';

export class CreateGalleryDto {
  @IsString({ message: 'Title must be a string' })
  @MinLength(2, { message: 'Title must be at least 2 characters long' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @MinLength(5, { message: 'Description must be at least 5 characters long' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description: string;

  @IsUrl({}, { message: 'Image URL must be a valid HTTP/HTTPS URL' })
  imageUrl: string;

  @IsIn(['aircraft', 'destination', 'service', 'event'], { 
    message: 'Category must be one of: aircraft, destination, service, event' 
  })
  category: 'aircraft' | 'destination' | 'service' | 'event';

  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean' })
  active?: boolean;
}
