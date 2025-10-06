import { 
  IsString, 
  IsNumber, 
  IsUrl, 
  IsIn, 
  IsOptional, 
  IsBoolean,
  MinLength,
  MaxLength,
  Min
} from 'class-validator';

export class CreateBannerDto {
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

  @IsOptional()
  @IsUrl({}, { message: 'Link must be a valid HTTP/HTTPS URL' })
  link?: string;

  @IsNumber({}, { message: 'Duration must be a number' })
  @Min(1, { message: 'Duration must be at least 1 day' })
  duration: number;

  @IsIn(['promotion', 'advertisement'], { 
    message: 'Type must be one of: promotion, advertisement' 
  })
  type: 'promotion' | 'advertisement';

  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean' })
  active?: boolean;
}
