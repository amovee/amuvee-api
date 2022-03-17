import { LocationsService } from './locations.service';

import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationSchema, Location } from 'src/shared/schemas/location.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema }
    ]),],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
