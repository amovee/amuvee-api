import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Action } from 'rxjs/internal/scheduler/Action';
import { ActionSchema } from '../../shared/schemas/action.schema';
import { Category, CategorySchema } from '../../shared/schemas/category.schema';
import { Insurance, InsuranceSchema } from '../../shared/schemas/insurance.schema';
import { Location, LocationSchema } from '../../shared/schemas/location.schema';
import { Region, RegionSchema } from '../../shared/schemas/region.schema';
import { Result, ResultSchema, ResultType, ResultTypeSchema } from '../../shared/schemas/result.schema';
import { MigrationController } from './migration.controller';
import { MigrationService } from './migration.service';
import { UsersModule } from '../users/users.module';
import { RegionModule } from '../region/region.module';
import { LocationsModule } from '../locations/locations.module';
import { CategoriesModule } from '../categories/categories.module';
import { InsurancesModule } from '../insurances/insurances.module';
import { ActionsModule } from '../actions/actions.module';
import { User, UserSchema } from 'src/shared/schemas/user.schema';
import { CountersModule } from '../counters/counters.module';

@Module({
  imports: [
    UsersModule,
    RegionModule,
    LocationsModule,
    CategoriesModule,
    InsurancesModule,
    ActionsModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Result.name, schema: ResultSchema },
      { name: ResultType.name, schema: ResultTypeSchema },
      { name: Insurance.name, schema: InsuranceSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Region.name, schema: RegionSchema },
      { name: Action.name, schema: ActionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CountersModule
  ],
  controllers: [MigrationController],
  providers: [
    MigrationService
  ],
})
export class MigrationModule {}
