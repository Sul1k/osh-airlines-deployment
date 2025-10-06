import { IsString, MinLength, MaxLength, Matches, IsMongoId, IsOptional, IsBoolean } from 'class-validator';

export class CreateCompanyDto {
  @IsString({ message: 'Company name must be a string' })
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Company name must not exceed 100 characters' })
  name: string;

  @IsString({ message: 'Company code must be a string' })
  @Matches(/^[A-Z]{2,3}$/, { message: 'Company code must be 2-3 uppercase letters' })
  code: string;

  @IsMongoId({ message: 'Manager ID must be a valid MongoDB ObjectId' })
  managerId: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}
