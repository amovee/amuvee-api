import { Module } from '@nestjs/common';
import { ResultsController as EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsService } from './events.service';
import { CountersModule } from '../counters/counters.module';
import { Event, EventSchema } from 'src/shared/schemas/event.schema';
import { User, UserSchema } from 'src/shared/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CountersModule
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService]
})
export class EventsModule {}