import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type RegionDocument = Region & Document;

@Schema()
export class Region {
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({type: [String]})
  zips: string[];
  @Prop()
  name: string;
  @Prop()
  id: string;
  @Prop()
  status: string;
  @Prop({type: {lon: Number, lat: Number}})
  position?: {lon: number, lat: number};
}

export const RegionSchema = SchemaFactory.createForClass(Region);