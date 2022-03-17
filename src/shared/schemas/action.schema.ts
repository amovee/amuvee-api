import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
export type ActionDocument = Action & Document;
export type ActionTypeDocument = Action & Document;
@Schema()
export class Action {
  @Prop()
  name: string;
  @Prop()
  type: number;
  @Prop()
  oldId: string;
  @Prop()
  description: string;

  @Prop()
  status: string;
  @Prop()
  sort: number;
  @Prop()
  userCreated: string;
  @Prop()
  dateCreated: Date;
  @Prop()
  userUpdated: string;
  @Prop()
  dateUpdated: Date;
}

export const ActionSchema = SchemaFactory.createForClass(Action);