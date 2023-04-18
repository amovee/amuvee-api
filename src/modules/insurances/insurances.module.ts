import { InsurancesService } from './insurances.service';
import { InsurancesController } from './insurances.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Insurance, InsuranceSchema } from '../../shared/schemas/insurance.schema';
import { CountersModule } from '../counters/counters.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Insurance.name, schema: InsuranceSchema }
    ]),
    CountersModule
  ],
  controllers: [InsurancesController],
  providers: [InsurancesService],
  exports: [InsurancesService],
})
export class InsurancesModule {}
