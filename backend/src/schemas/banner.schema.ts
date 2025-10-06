import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, trim: true })
  imageUrl: string;

  @Prop({ trim: true })
  link?: string;

  @Prop({ required: true, min: 1 })
  duration: number; // in seconds

  @Prop({ default: true })
  active: boolean;

  @Prop({ required: true, enum: ['promotion', 'advertisement'] })
  type: 'promotion' | 'advertisement';
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
