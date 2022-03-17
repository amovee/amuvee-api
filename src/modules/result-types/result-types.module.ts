import { ResultTypesService } from './result-types.service';
import { ResultTypesController } from './result-types.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetaSchema } from 'src/shared/schemas/meta.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ResultType', schema: MetaSchema },
    ]),],
  controllers: [ResultTypesController],
  providers: [ResultTypesService],
})
export class ResultTypesModule {}
