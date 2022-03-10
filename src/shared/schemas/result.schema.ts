import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResultDocument = Result & Document;

@Schema()
export class Result {
  @Prop()
  name: string;
}

export const ResultSchema = SchemaFactory.createForClass(Result);