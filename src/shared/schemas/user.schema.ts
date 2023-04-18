import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { right } from 'src/types/rights';

export type UserDocument = User & Document;

@Schema()
export class User {
  _id: mongoose.Schema.Types.ObjectId;
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
}

export const UserSchema = SchemaFactory.createForClass(User);