import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
export type InsuranceDocument = Insurance & Document;
@Schema()
export class Insurance {
  _id: mongoose.Schema.Types.ObjectId;
  @Prop()
  name: string;
  @Prop()
  isPublic: boolean;
  @Prop()
  oldId: number;
  @Prop()
  status: string;
  @Prop()
  sort: number; // weight
}

export const InsuranceSchema = SchemaFactory.createForClass(Insurance);
