import { Controller, Get, Post } from '@nestjs/common';
import { Insurance } from './insurance.schema';
import { InsurancesService } from './insurances.service';

@Controller('insurance')
export class InsurancesController {
  constructor(private readonly insurancesService: InsurancesService) {}
  // No Auth but filtered
  @Post('migrate')
  async migrate(): Promise<string> {
    await this.insurancesService.migrate();
    return 'done';
  }
  @Get()
  async getAll(): Promise<Insurance[]> {
    return this.insurancesService.getAll();
  }
}
