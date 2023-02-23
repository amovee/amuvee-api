import { LocationsService } from './locations.service';

import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationSchema, Location } from './location.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
