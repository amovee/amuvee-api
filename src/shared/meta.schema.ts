import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export type MetaDocument = Meta & Document;
@Schema()
export class Meta {
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

export const MetaSchema = SchemaFactory.createForClass(Meta);
