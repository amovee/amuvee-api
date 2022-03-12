import { Controller, Get, Post } from '@nestjs/common';
import { MigrationService } from './migration.service';

@Controller('migration')
export class MigrationController {
  constructor(private readonly migraionService: MigrationService) {}
  @Post('users')
  async migrateAllUsers(): Promise<any> {
    return await this.migraionService.migrateUsers();
  }
  @Post('categories')
  async migrateAllCategories(): Promise<any> {
    return await this.migraionService.migrateCategories();
  }
}
