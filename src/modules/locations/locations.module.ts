import { LocationsService } from './locations.service';

import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationSchema, Location } from 'src/shared/schemas/location.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/shared/schemas/user.schema';
import { CountersModule } from '../counters/counters.module';
import { UsersModule } from '../users/users.module';
import {ResultsModule} from "../results/results.module";
import {Result, ResultSchema} from "../../shared/schemas/result.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
      { name: User.name, schema: UserSchema },
      { name: Result.name, schema: ResultSchema },
    ]),
    ResultsModule,
    CountersModule,
    UsersModule,
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
