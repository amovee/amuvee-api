import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegionSchema, Region } from '../../shared/schemas/region.schema';
import { CountersModule } from '../counters/counters.module';
import { ResultsModule } from '../results/results.module';
import { RegionController } from './region.controller';
import { RegionService } from './region.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Region.name, schema: RegionSchema }]),
    ResultsModule,
    CountersModule
  ],
  controllers: [RegionController],
  providers: [RegionService],
  exports: [RegionService],
})
export class RegionModule {}
