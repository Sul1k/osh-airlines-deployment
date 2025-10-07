import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flight, FlightDocument } from '../schemas/flight.schema';

@Injectable()
export class FlightsService {
  constructor(@InjectModel(Flight.name) private flightModel: Model<FlightDocument>) {}

  async create(createFlightDto: any): Promise<Flight> {
    // Validate required fields
    this.validateFlightData(createFlightDto);

    // Check for duplicate flight number within company
    const existingFlight = await this.flightModel.findOne({
      flightNumber: createFlightDto.flightNumber,
      companyId: createFlightDto.companyId
    });

    if (existingFlight) {
      throw new ConflictException(`Flight number ${createFlightDto.flightNumber} already exists for this company`);
    }

    // Calculate status based on departure time
    const status = this.calculateFlightStatus(createFlightDto.departureDate);
    
    const flight = new this.flightModel({
      ...createFlightDto,
      status
    });
    return flight.save();
  }

  private validateFlightData(flightData: any): void {
    const requiredFields = ['flightNumber', 'origin', 'destination', 'departureDate', 'arrivalDate', 'companyId'];
    
    for (const field of requiredFields) {
      if (!flightData[field]) {
        throw new BadRequestException(`${field} is required`);
      }
    }

    // Validate dates
    const departureDate = new Date(flightData.departureDate);
    const arrivalDate = new Date(flightData.arrivalDate);
    const now = new Date();

    if (departureDate < now) {
      throw new BadRequestException('Departure date cannot be in the past');
    }

    if (arrivalDate <= departureDate) {
      throw new BadRequestException('Arrival date must be after departure date');
    }

    // Validate origin and destination are different
    if (flightData.origin.toLowerCase() === flightData.destination.toLowerCase()) {
      throw new BadRequestException('Origin and destination cannot be the same');
    }

    // Validate at least one seat class has both price and seats
    const hasValidSeatClass = 
      (flightData.economyPrice > 0 && flightData.economySeats > 0) ||
      (flightData.comfortPrice > 0 && flightData.comfortSeats > 0) ||
      (flightData.businessPrice > 0 && flightData.businessSeats > 0);

    if (!hasValidSeatClass) {
      throw new BadRequestException('At least one seat class must have both price and seats');
    }

    // Validate numeric values
    if (flightData.duration <= 0) {
      throw new BadRequestException('Duration must be positive');
    }
  }

  async findAll(): Promise<Flight[]> {
    const flights = await this.flightModel.find().exec();
    
    // Update statuses for all flights based on current time
    const updatedFlights = await Promise.all(
      flights.map(async (flight) => {
        const newStatus = this.calculateFlightStatus(flight.departureDate);
        if (flight.status !== newStatus) {
          flight.status = newStatus;
          await flight.save();
        }
        return flight;
      })
    );
    
    return updatedFlights;
  }

  async findOne(id: string): Promise<Flight | null> {
    return this.flightModel.findById(id).exec();
  }

  async update(id: string, updateFlightDto: any): Promise<Flight | null> {
    return this.flightModel.findByIdAndUpdate(id, updateFlightDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Flight | null> {
    return this.flightModel.findByIdAndDelete(id).exec();
  }

  async searchFlights(searchDto: any): Promise<Flight[]> {
    const { origin, destination, departureDate, passengers, seatClass } = searchDto;
    
    const query: any = {
      origin: new RegExp(origin, 'i'),
      destination: new RegExp(destination, 'i'),
      isActive: true,
    };

    if (departureDate) {
      const startDate = new Date(departureDate);
      const endDate = new Date(departureDate);
      endDate.setDate(endDate.getDate() + 1);
      query.departureDate = { $gte: startDate, $lt: endDate };
    }

    return this.flightModel.find(query).exec();
  }

  private calculateFlightStatus(departureDate: Date): 'upcoming' | 'passed' {
    const now = new Date();
    const departure = new Date(departureDate);
    return departure > now ? 'upcoming' : 'passed';
  }

  async cancelFlight(id: string): Promise<Flight | null> {
    return this.flightModel.findByIdAndUpdate(
      id, 
      { status: 'cancelled' }, 
      { new: true }
    ).exec();
  }
}
