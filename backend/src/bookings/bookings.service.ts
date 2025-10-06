import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from '../schemas/booking.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Flight, FlightDocument } from '../schemas/flight.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Flight.name) private flightModel: Model<FlightDocument>
  ) {}

  async create(createBookingDto: any): Promise<Booking> {
    // Validate booking data
    await this.validateBookingData(createBookingDto);

    // Generate unique confirmation ID
    const confirmationId = this.generateConfirmationId();
    
    const booking = new this.bookingModel({
      ...createBookingDto,
      confirmationId,
      status: 'confirmed'
    });
    
    return booking.save();
  }

  private async validateBookingData(bookingData: any): Promise<void> {
    const requiredFields = ['userId', 'flightId', 'passengerName', 'passengerEmail', 'seatClass', 'price'];
    
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        throw new BadRequestException(`${field} is required`);
      }
    }

    // Validate ObjectId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(bookingData.userId)) {
      throw new BadRequestException(`Invalid user ID format: ${bookingData.userId}`);
    }
    if (!objectIdRegex.test(bookingData.flightId)) {
      throw new BadRequestException(`Invalid flight ID format: ${bookingData.flightId}`);
    }

    // Validate user exists
    const user = await this.userModel.findById(bookingData.userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${bookingData.userId} not found`);
    }

    // Validate flight exists
    const flight = await this.flightModel.findById(bookingData.flightId);
    if (!flight) {
      throw new NotFoundException(`Flight with ID ${bookingData.flightId} not found`);
    }

    // Validate seat class
    const validSeatClasses = ['economy', 'comfort', 'business'];
    if (!validSeatClasses.includes(bookingData.seatClass)) {
      throw new BadRequestException(`Invalid seat class. Must be one of: ${validSeatClasses.join(', ')}`);
    }

    // Validate price matches flight price for seat class
    const expectedPrice = this.getFlightPriceForSeatClass(flight, bookingData.seatClass);
    if (bookingData.price !== expectedPrice) {
      throw new BadRequestException(`Price mismatch. Expected ${expectedPrice} for ${bookingData.seatClass} class`);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.passengerEmail)) {
      throw new BadRequestException('Invalid email format');
    }
  }

  private getFlightPriceForSeatClass(flight: any, seatClass: string): number {
    switch (seatClass) {
      case 'economy':
        return flight.economyPrice;
      case 'comfort':
        return flight.comfortPrice;
      case 'business':
        return flight.businessPrice;
      default:
        throw new BadRequestException(`Invalid seat class: ${seatClass}`);
    }
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel.find().exec();
  }

  async findOne(id: string): Promise<Booking | null> {
    return this.bookingModel.findById(id).exec();
  }

  async findByConfirmationId(confirmationId: string): Promise<Booking | null> {
    return this.bookingModel.findOne({ confirmationId }).exec();
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    return this.bookingModel.find({ userId }).exec();
  }

  async update(id: string, updateBookingDto: any): Promise<Booking | null> {
    return this.bookingModel.findByIdAndUpdate(id, updateBookingDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Booking | null> {
    return this.bookingModel.findByIdAndDelete(id).exec();
  }

  async cancelBooking(id: string): Promise<Booking | null> {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Get flight details to check departure time
    const flight = await this.flightModel.findById(booking.flightId).exec();
    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    const departureDate = new Date(flight.departureDate);
    const now = new Date();
    const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Determine if refund is eligible (24+ hours before departure)
    const isRefundEligible = hoursUntilDeparture >= 24;
    const newStatus = isRefundEligible ? 'refunded' : 'cancelled';

    return this.bookingModel.findByIdAndUpdate(
      id, 
      { 
        status: newStatus, 
        cancelledAt: new Date(),
        refundedAt: isRefundEligible ? new Date() : null
      }, 
      { new: true }
    ).exec();
  }

  private generateConfirmationId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
