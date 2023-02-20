import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Action, ActionSchema } from '../actions/action.schema';
import { Insurance, InsuranceSchema } from '../insurances/insurance.schema';
import { Region, RegionSchema } from '../../schemas/region.schema';
import { Filter, FilterSchema, Result, ResultSchema } from './result.schema';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Result.name, schema: ResultSchema },
      { name: Region.name, schema: RegionSchema },
      { name: Insurance.name, schema: InsuranceSchema },
      { name: Action.name, schema: ActionSchema },
      { name: Filter.name, schema: FilterSchema },
    ]),
  ],
  controllers: [ResultsController],
  providers: [ResultsService],
  exports: [ResultsService]
})
export class ResultsModule {}