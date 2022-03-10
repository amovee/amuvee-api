import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Result, ResultSchema } from './result.schema';

export type CategoryDocument = Category & Document;


@Schema()
export class Category {
  @Prop()
  name: string;
  @Prop([{ type: ResultSchema }])
  results: Result[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);