import { 
  IsString, 
  IsEmail, 
  IsMongoId, 
  IsNumber, 
  Min, 
  IsIn, 
  MinLength 
} from 'class-validator';

export class CreateBookingDto {
  @IsMongoId({ message: 'User ID must be a valid MongoDB ObjectId' })
  userId: string;

  @IsMongoId({ message: 'Flight ID must be a valid MongoDB ObjectId' })
  flightId: string;

  @IsString({ message: 'Passenger name must be a string' })
  @MinLength(2, { message: 'Passenger name must be at least 2 characters long' })
  passengerName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  passengerEmail: string;

  @IsIn(['economy', 'comfort', 'business'], { 
    message: 'Seat class must be one of: economy, comfort, business' 
  })
  seatClass: 'economy' | 'comfort' | 'business';

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be non-negative' })
  price: number;
}
