import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Region, RegionSchema } from '../../schemas/region.schema';
import { ResultsModule } from '../results/results.module';
import { RegionController } from './region.controller';
import { RegionService } from './region.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Region.name, schema: RegionSchema }]),
    ResultsModule,
  ],
  controllers: [RegionController],
  providers: [RegionService],
})
export class RegionModule {}
