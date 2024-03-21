import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
export type InsuranceDocument = Insurance & Document;
@Schema()
export class Insurance {
  _id: mongoose.Schema.Types.ObjectId;
  @Prop()
  id: number;
  @Prop({ type: mongoose.Schema.Types.Map, of: String})
  name: {[key: string]: string;};
  @Prop()
  isPublic: boolean;
  @Prop()
  status: string;
  @Prop()
  sort: number; // weight
}

export const InsuranceSchema = SchemaFactory.createForClass(Insurance);
