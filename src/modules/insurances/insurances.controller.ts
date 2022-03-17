import { Controller, Get } from '@nestjs/common';
import { Meta } from 'src/shared/schemas/meta.schema';
import { InsurancesService } from './insurances.service';

@Controller('insurances')
export class InsurancesController {
    constructor(
      private readonly insurancessService: InsurancesService,
    ) {}
    // No Auth but filtered
    @Get()
    async findAll(): Promise<Meta[]> {
      return (await this.insurancessService.findAll());
    }}
