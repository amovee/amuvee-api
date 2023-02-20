import { Controller, Post } from '@nestjs/common';
import { ActionsService } from '../actions/actions.service';
import { CategoriesService } from '../categories/categories.service';
import { InsurancesService } from '../insurances/insurances.service';
import { LocationsService } from '../locations/locations.service';
import { RegionService } from '../region/region.service';
import { UsersService } from '../users/users.service';
import { MigrationService } from './migration.service';

@Controller('migration')
export class MigrationController {
  constructor(private readonly migraionService: MigrationService,
    private regionService: RegionService,
    private locationService: LocationsService,
    private categoryService: CategoriesService,
    private insuranceService: InsurancesService,
    private actionService: ActionsService,
    private userService: UsersService) {}
  // @Post('users')
  // async migrateAllUsers(): Promise<any> {
  //   return await this.migraionService.migrateUsers();
  // }
  @Post('all')
  async migrateAll(): Promise<string> {
    await this.migrateAllHelpers();
    await this.migrateAllResultsFromAllCategories();
    return 'done'
  }
  @Post('users')
  async migrateUsers(): Promise<string> {
    this.userService.migrate();
    return 'done'
  }
  @Post('region')
  async migrateRegion(): Promise<string> {
    this.regionService.migrate();
    return 'done'
  }
  @Post('location')
  async migrateLocation(): Promise<string> {
    this.locationService.migrate();
    return 'done'
  }
  @Post('category')
  async migrateCategory(): Promise<string> {
    this.categoryService.migrate();
    return 'done'
  }
  @Post('insurance')
  async migrateInsurances(): Promise<string> {
    this.insuranceService.migrate();
    return 'done'
  }
  @Post('action')
  async migrateActions(): Promise<string> {
    await this.actionService.migrate();
    return 'done'
  }
  
  @Post('helpers')
  async migrateAllHelpers(): Promise<string> {
    await this.userService.migrate();
    await this.categoryService.migrate();
    await this.locationService.migrate();
    await this.regionService.migrate();
    await this.insuranceService.migrate();
    await this.actionService.migrate();
    return "done";
  }
  @Post('results')
  async migrateAllResultsFromAllCategories(): Promise<string> {
    await this.migraionService.migrateResultsFromAllCategories();
    return 'done';
  }
}
