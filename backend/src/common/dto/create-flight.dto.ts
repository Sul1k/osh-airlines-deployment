import { 
  IsString, 
  IsDateString, 
  IsNumber, 
  Min, 
  MinLength,
  IsMongoId, 
  IsOptional, 
  IsBoolean,
  ValidateIf,
  IsPositive
} from 'class-validator';

export class CreateFlightDto {
  @IsString({ message: 'Flight number must be a string' })
  @MinLength(3, { message: 'Flight number must be at least 3 characters long' })
  flightNumber: string;

  @IsString({ message: 'Origin must be a string' })
  @MinLength(2, { message: 'Origin must be at least 2 characters long' })
  origin: string;

  @IsString({ message: 'Destination must be a string' })
  @MinLength(2, { message: 'Destination must be at least 2 characters long' })
  destination: string;

  @IsDateString({}, { message: 'Departure date must be a valid ISO date string' })
  departureDate: string;

  @IsDateString({}, { message: 'Arrival date must be a valid ISO date string' })
  arrivalDate: string;

  @IsNumber({}, { message: 'Duration must be a number' })
  @IsPositive({ message: 'Duration must be a positive number' })
  duration: number;

  @IsMongoId({ message: 'Company ID must be a valid MongoDB ObjectId' })
  companyId: string;

  @IsNumber({}, { message: 'Economy price must be a number' })
  @Min(0, { message: 'Economy price must be non-negative' })
  economyPrice: number;

  @IsNumber({}, { message: 'Economy seats must be a number' })
  @Min(0, { message: 'Economy seats must be non-negative' })
  economySeats: number;

  @IsOptional()
  @IsNumber({}, { message: 'Comfort price must be a number' })
  @Min(0, { message: 'Comfort price must be non-negative' })
  comfortPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Comfort seats must be a number' })
  @Min(0, { message: 'Comfort seats must be non-negative' })
  comfortSeats?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Business price must be a number' })
  @Min(0, { message: 'Business price must be non-negative' })
  businessPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Business seats must be a number' })
  @Min(0, { message: 'Business seats must be non-negative' })
  businessSeats?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}
