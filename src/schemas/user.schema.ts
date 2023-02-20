import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  _id: mongoose.Schema.Types.ObjectId;
  @Prop()
  name: string;
  @Prop()
  oldId: string;
  @Prop()
  password: string;
  @Prop()
  email: string;
  @Prop()
  role: string;
  @Prop()
  token?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);