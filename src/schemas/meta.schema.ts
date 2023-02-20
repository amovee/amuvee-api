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
}

export const MetaSchema = SchemaFactory.createForClass(Meta);
