import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegionSchema, Region } from 'src/shared/schemas/region.schema';
import { CountersModule } from '../counters/counters.module';
import { ResultsModule } from '../results/results.module';
import { RegionController } from './region.controller';
import { RegionService } from './region.service';
import {UsersModule} from "../users/users.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Region.name, schema: RegionSchema }]),
    ResultsModule,
    CountersModule,
    UsersModule
  ],
  controllers: [RegionController],
  providers: [RegionService],
  exports: [RegionService],
})
export class RegionModule {}
