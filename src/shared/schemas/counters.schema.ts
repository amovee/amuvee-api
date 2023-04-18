import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
export type CountersDocument = Counter & Document;

@Schema()
export class Counter {
  @Prop()
  _id: string;
  @Prop()
  sequence_value: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
