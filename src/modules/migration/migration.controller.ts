import { Controller, Post } from '@nestjs/common';
import { ActionsService } from '../actions/actions.service';
import { CategoriesService } from '../categories/categories.service';
import { InsurancesService } from '../insurances/insurances.service';
import { LocationsService } from '../locations/locations.service';
import { RegionService } from '../region/region.service';
import { UsersService } from '../users/users.service';
import { MigrationService } from './migration.service';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';

@ApiTags('Migrations')
@ApiBearerAuth('jwt')
@Controller('migration')
export class MigrationController {
  constructor(
    private readonly migraionService: MigrationService,
    private regionService: RegionService,
    private locationService: LocationsService,
    private categoryService: CategoriesService,
    private insuranceService: InsurancesService,
    private actionService: ActionsService,
    private userService: UsersService,
  ) {}
  @Post('all')
  async migrateAll(): Promise<void> {
    await this.migrateAllHelpers();
    await this.migrateAllResultsFromAllCategories();
  }
  @Post('users')
  async migrateUsers(): Promise<void> {
    this.userService.migrate();
  }
  @Post('regions')
  async migrateRegion(): Promise<void> {
    this.regionService.migrate();
  }
  @Post('locations')
  async migrateLocation(): Promise<void> {
    this.locationService.migrate();
  }
  @Post('categories')
  async migrateCategory(): Promise<void> {
    this.categoryService.migrate();
  }
  @Post('insurances')
  async migrateInsurances(): Promise<void> {
    this.insuranceService.migrate();
  }
  @Post('actions')
  async migrateActions(): Promise<void> {
    await this.actionService.migrate();
  }

  @Post('helpers')
  async migrateAllHelpers(): Promise<void> {
    await this.userService.migrate();
    await this.categoryService.migrate();
    await this.locationService.migrate();
    await this.regionService.migrate();
    await this.insuranceService.migrate();
    await this.actionService.migrate();
    await this.migraionService.migrateResulttypes();
  }

  @Post('resulttypes')
  async migrateResulttypes(): Promise<void> {
    await this.migraionService.migrateResulttypes();
  }
  @Post('results')
  async migrateAllResultsFromAllCategories(): Promise<void> {
    await this.migraionService.migrateResultsFromAllCategories();
  }
}
