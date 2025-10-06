import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  flightId: string;

  @Prop({ required: true })
  passengerName: string;

  @Prop({ required: true })
  passengerEmail: string;

  @Prop({ required: true, enum: ['economy', 'comfort', 'business'] })
  seatClass: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, unique: true })
  confirmationId: string;

  @Prop({ default: 'confirmed', enum: ['confirmed', 'cancelled', 'refunded'] })
  status: string;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  refundedAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
