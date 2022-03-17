import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  username: string;
  @Prop()
  password: string;
  @Prop()
  role: string;
  @Prop()
  oldId: string;
  @Prop()
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);