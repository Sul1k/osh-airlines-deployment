import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GalleryDocument = Gallery & Document;

@Schema({ timestamps: true })
export class Gallery {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, trim: true })
  imageUrl: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ required: true, enum: ['aircraft', 'destination', 'service', 'event'] })
  category: 'aircraft' | 'destination' | 'service' | 'event';
}

export const GallerySchema = SchemaFactory.createForClass(Gallery);
