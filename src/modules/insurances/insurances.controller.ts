import { Controller, Get, Post } from '@nestjs/common';
import { Insurance } from 'src/shared/schemas/insurance.schema';
import { InsurancesService } from './insurances.service';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';

@ApiTags('Insurances')
@Controller('insurance')
export class InsurancesController {
  constructor(private readonly insurancesService: InsurancesService) {}
  // No Auth but filtered
  @ApiBearerAuth('jwt')
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
