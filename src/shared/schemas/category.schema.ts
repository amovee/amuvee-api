import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Result, ResultSchema } from './result.schema';

export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  // @Prop([{ type: ResultSchema }])
  // @Prop()
  // results: string[];
  @Prop()
  description: string;

  // META
  @Prop()
  name: string;
  @Prop()
  oldId: number;
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

export const CategorySchema = SchemaFactory.createForClass(Category);
/*
{
  "id": 4,
  "status": "published",
  "sort": 4,
  "user_created": "a14867ad-4ec3-4506-bdb6-b0fe6dabf5ba",
  "date_created": "2021-04-29T06:24:10Z",
  "user_updated": "a14867ad-4ec3-4506-bdb6-b0fe6dabf5ba",
  "date_updated": "2021-12-02T13:44:38Z",
  "name": "Trennung",
  "description": "<p>Dein <strong>Scout,</strong> der dich durch Trennung und Scheidung f&uuml;hrt &ndash; mit Tipps zu Ansprechpartnern in deiner Region bis zu den Themen, die du erledigen musst.</p>"
},*/
