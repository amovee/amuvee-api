import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Action, ActionSchema } from 'src/shared/schemas/action.schema';
import { Insurance, InsuranceSchema } from 'src/shared/schemas/insurance.schema';
import { MetaSchema } from 'src/shared/schemas/meta.schema';
import { Region, RegionSchema } from 'src/shared/schemas/region.schema';
import { Result, ResultSchema } from 'src/shared/schemas/result.schema';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Result.name, schema: ResultSchema },
      { name: Region.name, schema: RegionSchema },
      { name: 'RelationshipType', schema: MetaSchema },
      { name: 'JobRelatedSituation', schema: MetaSchema },
      { name: Insurance.name, schema: InsuranceSchema },
      { name: Action.name, schema: ActionSchema },
    ]),
  ],
  controllers: [ResultsController],
  providers: [ResultsService],
})
export class ResultsModule {}