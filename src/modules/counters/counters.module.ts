import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Counter, CounterSchema as CounterSchema } from '../../shared/schemas/counters.schema';
import { ResultsModule } from '../results/results.module';
import { CounterService } from './counters.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Counter.name, schema: CounterSchema },
    ]),
    ResultsModule,
  ],
  providers: [CounterService],
  exports: [CounterService],
})
export class CountersModule {}