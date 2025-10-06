import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FlightDocument = Flight & Document;

@Schema({ timestamps: true })
export class Flight {
  @Prop({ required: true })
  flightNumber: string;

  @Prop({ required: true })
  origin: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  departureDate: Date;

  @Prop({ required: true })
  arrivalDate: Date;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  companyId: string;

  @Prop({ required: true })
  economyPrice: number;

  @Prop({ required: true })
  economySeats: number;

  @Prop({ default: 0 })
  comfortPrice: number;

  @Prop({ default: 0 })
  comfortSeats: number;

  @Prop({ default: 0 })
  businessPrice: number;

  @Prop({ default: 0 })
  businessSeats: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ 
    default: 'upcoming',
    enum: ['upcoming', 'passed']
  })
  status: 'upcoming' | 'passed';
}

export const FlightSchema = SchemaFactory.createForClass(Flight);

// Add compound unique index for flightNumber + companyId
FlightSchema.index({ flightNumber: 1, companyId: 1 }, { unique: true });
