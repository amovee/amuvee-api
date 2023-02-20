import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Action } from 'rxjs/internal/scheduler/Action';
import { ActionSchema } from '../actions/action.schema';
import { Category, CategorySchema } from '../categories/category.schema';
import { Insurance, InsuranceSchema } from '../insurances/insurance.schema';
import { Location, LocationSchema } from '../locations/location.schema';
import { MetaSchema } from '../../schemas/meta.schema';
import { Region, RegionSchema } from '../../schemas/region.schema';
import { Filter, FilterSchema, Result, ResultSchema } from '../results/result.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { ActionsService } from '../actions/actions.service';
import { CategoriesService } from '../categories/categories.service';
import { InsurancesService } from '../insurances/insurances.service';
import { LocationsService } from '../locations/locations.service';
import { RegionService } from '../region/region.service';
import { UsersService } from '../users/users.service';
import { MigrationController } from './migration.controller';
import { MigrationService } from './migration.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Result.name, schema: ResultSchema },
      { name: Filter.name, schema: FilterSchema },
      { name: 'ResultType', schema: MetaSchema },
      { name: Insurance.name, schema: InsuranceSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Region.name, schema: RegionSchema },
      { name: Action.name, schema: ActionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [MigrationController],
  providers: [
    MigrationService,
    RegionService,
    LocationsService,
    CategoriesService,
    InsurancesService,
    ActionsService,
    UsersService
  ],
})
export class MigrationModule {}
