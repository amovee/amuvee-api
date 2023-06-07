import { LocationsService } from './locations.service';

import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationSchema, Location } from 'src/shared/schemas/location.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/shared/schemas/user.schema';
import { CountersModule } from '../counters/counters.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CountersModule
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
