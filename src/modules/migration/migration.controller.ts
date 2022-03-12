import { Controller, Get, Post } from '@nestjs/common';
import { MigrationService } from './migration.service';

@Controller('migration')
export class MigrationController {
  constructor(private readonly migraionService: MigrationService) {}
  @Post('users')
  async getHello(): Promise<any> {
    return await this.migraionService.migrateUsers();
  }
}
