import { InsurancesService } from './insurances.service';
import { InsurancesController } from './insurances.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Insurance, InsuranceSchema } from 'src/shared/schemas/insurance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Insurance.name, schema: InsuranceSchema }
    ]),],
  controllers: [InsurancesController],
  providers: [InsurancesService],
})
export class InsurancesModule {}
