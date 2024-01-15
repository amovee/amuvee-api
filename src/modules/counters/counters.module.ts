import {forwardRef, Module} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Counter, CounterSchema as CounterSchema } from 'src/shared/schemas/counters.schema';
import { ResultsModule } from '../results/results.module';
import { CounterService } from './counters.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Counter.name, schema: CounterSchema },
    ]),
    forwardRef(()=> ResultsModule),
  ],
  providers: [CounterService],
  exports: [CounterService],
})
export class CountersModule {}