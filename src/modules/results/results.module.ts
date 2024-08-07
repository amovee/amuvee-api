import {forwardRef, Module} from '@nestjs/common';
import { Action, ActionSchema } from 'src/shared/schemas/action.schema';
import { Insurance, InsuranceSchema } from 'src/shared/schemas/insurance.schema';
import { Region, RegionSchema } from 'src/shared/schemas/region.schema';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';
import { MinResult, MinResultSchema, Result, ResultSchema, ResultType, ResultTypeSchema } from 'src/shared/schemas/result.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/modules/users/users.module';
import { CountersModule } from '../counters/counters.module';
import { User, UserSchema } from 'src/shared/schemas/user.schema';
import { Location, LocationSchema } from 'src/shared/schemas/location.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Result.name, schema: ResultSchema },
      { name: ResultType.name, schema: ResultTypeSchema },
      { name: Region.name, schema: RegionSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Insurance.name, schema: InsuranceSchema },
      { name: Action.name, schema: ActionSchema },
      { name: MinResult.name, schema: MinResultSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(()=> UsersModule),
    forwardRef(()=> CountersModule),
  ],
  controllers: [ResultsController],
  providers: [ResultsService],
  exports: [ResultsService]
})
export class ResultsModule {}