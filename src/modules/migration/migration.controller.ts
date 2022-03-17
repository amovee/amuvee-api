import { Controller, Get, Param, Post } from '@nestjs/common';
import { MigrationService } from './migration.service';

@Controller('migration')
export class MigrationController {
  constructor(private readonly migraionService: MigrationService) {}
  @Post('users')
  async migrateAllUsers(): Promise<any> {
    return await this.migraionService.migrateUsers();
  }
  @Post('all')
  async migrateAll(): Promise<any> {
    await this.migrateAllHelpers();
    await this.migrateAllResultsFromAllCategories();
    return 'done'
  }
  
  @Post('helpers')
  async migrateAllHelpers(): Promise<any> {
    await this.migraionService.migrateCategories();
    await this.migraionService.migrateLocations();
    await this.migraionService.migrateActions();
    await this.migraionService.migrateRegions();
    await this.migraionService.migrateResultTypes();
    await this.migraionService.migrateInsurances();
    await this.migraionService.migrateRelationshipTypes();
    await this.migraionService.migrateJobRelatedSituations();
    return "done";
  }
  @Post('categories')
  async migrateAllCategories(): Promise<any> {
    return await this.migraionService.migrateCategories();
  }
  @Post('actions')
  async migrateAllActions(): Promise<any> {
    return await this.migraionService.migrateActions();
  }
  @Post('locations')
  async migrateAllLocations(): Promise<any> {
    return await this.migraionService.migrateLocations();
  }
  @Post('regions')
  async migrateAllRegions(): Promise<any> {
    return await this.migraionService.migrateRegions();
  }
  @Post('result_types')
  async migrateAllResultTypes(): Promise<any> {
    return await this.migraionService.migrateResultTypes();
  }
  @Post('insurances')
  async migrateAllInsurances(): Promise<any> {
    return await this.migraionService.migrateInsurances();
  }
  @Post('relationship_types')
  async migrateAllRelationshipTypes(): Promise<any> {
    return await this.migraionService.migrateRelationshipTypes();
  }
  @Post('job_related_situations')
  async migrateAllJobRelatedSituations(): Promise<any> {
    return await this.migraionService.migrateJobRelatedSituations();
  }
  @Post('results/:id')
  async migrateAllResults(@Param('id') id: string): Promise<any> {
    return await this.migraionService.migrateResults(id);
  }
  @Post('results')
  async migrateAllResultsFromAllCategories(): Promise<any> {
    return await this.migraionService.migrateResultsFromAllCategories();
  }
}
