import { Module } from '@nestjs/common';
import { Action, ActionSchema } from '../../shared/schemas/action.schema';
import { Insurance, InsuranceSchema } from '../../shared/schemas/insurance.schema';
import { Region, RegionSchema } from '../../shared/schemas/region.schema';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';
import { Result, ResultSchema, ResultType, ResultTypeSchema } from '../../shared/schemas/result.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RegionModule } from '../region/region.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Result.name, schema: ResultSchema },
      { name: ResultType.name, schema: ResultTypeSchema },
      { name: Region.name, schema: RegionSchema },
      { name: Insurance.name, schema: InsuranceSchema },
      { name: Action.name, schema: ActionSchema },
    ]),
  ],
  controllers: [ResultsController],
  providers: [ResultsService],
  exports: [ResultsService]
})
export class ResultsModule {}