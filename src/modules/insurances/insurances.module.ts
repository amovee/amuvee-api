import { InsurancesService } from './insurances.service';
import { InsurancesController } from './insurances.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Insurance, InsuranceSchema } from 'src/shared/schemas/insurance.schema';
import { CountersModule } from '../counters/counters.module';
import {UsersModule} from "../users/users.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Insurance.name, schema: InsuranceSchema }
    ]),
    CountersModule,
    UsersModule
  ],
  controllers: [InsurancesController],
  providers: [InsurancesService],
  exports: [InsurancesService],
})
export class InsurancesModule {}
