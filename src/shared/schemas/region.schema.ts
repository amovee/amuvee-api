import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Result, ResultSchema } from './result.schema';

export type RegionDocument = Region & Document;

@Schema()
export class Region {
  @Prop({type: [String]})
  postalCodes: string[];
  // META
  @Prop()
  name: string;
  @Prop()
  oldId: string;
  @Prop()
  status: string;
  @Prop()
  sort: number; // weight
  @Prop()
  userCreated: string;
  @Prop()
  dateCreated: Date;
  @Prop()
  userUpdated: string;
  @Prop()
  dateUpdated: Date;
}

export const RegionSchema = SchemaFactory.createForClass(Region);