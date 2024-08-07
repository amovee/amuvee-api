import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { right } from 'src/shared/dtos/rights';
import { v4 as uuidv4 } from 'uuid';

export type UserDocument = User & Document;

@Schema()
export class User {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ default: uuidv4, unique: true, index: true })
  uuid: string;
  @Prop()
  name: string;
  @Prop()
  oldId: string;
  @Prop()
  password?: string;
  @Prop()
  email: string;
  @Prop({ type: [String] })
  rights: right[];
  @Prop()
  isAdmin: boolean;
  @Prop()
  token?: string;
  @Prop()
  roles: string[];
  @Prop({ default: uuidv4 })
  activity?: string
}

export const UserSchema = SchemaFactory.createForClass(User);