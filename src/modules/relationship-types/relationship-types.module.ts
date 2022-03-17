import { RelationshipTypesService } from './relationship-types.service';
import { RelationshipTypesController } from './relationship-types.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetaSchema } from 'src/shared/schemas/meta.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'RelationshipType', schema: MetaSchema },
    ]),],
  controllers: [RelationshipTypesController],
  providers: [RelationshipTypesService],
})
export class RelationshipTypesModule {}
