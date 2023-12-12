import {Controller, Delete, Get, Param, Post, Query,Body, UseGuards} from '@nestjs/common';
import { Insurance } from 'src/shared/schemas/insurance.schema';
import { InsurancesService } from './insurances.service';
import {Right} from "../auth/rights/rights.decorator";
import {RightsGuard} from "../auth/rights/rights.guard";
import {JwtAuthGuard} from "../auth/jwt/jwt-auth.guard";
import {createInsurance, updateInsurance} from "../../shared/dtos/insurances.dto";
import {request} from "express";

@Controller('insurance')
export class InsurancesController {
  constructor(private readonly insurancesService: InsurancesService) {}
  // No Auth but filtered
  @Post('migrate')
  async migrate(): Promise<string> {
    await this.insurancesService.migrate();
    return 'done';
  }
  @Get('all')
  async getAll(): Promise<Insurance[]> {
    return this.insurancesService.getAll();
  }

  // Auth
  @Right('INSURANCES_READ')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Get('paginated')
  async getAllInsurances(@Query('limit') limit: number = 20, @Query('skip') skip: number = 20): Promise<Insurance[]> {
    return this.insurancesService.getAllInsurances(limit, skip);
  }

  @Right('INSURANCES_READ')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Post()
  async createInsurance(@Body() body: createInsurance): Promise<Insurance> {
    return this.insurancesService.createInsurance(body);
  }

  @Right('INSURANCES_UPDATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Post(':id')
  async updateInsurance(@Param('id') id: string, @Body() body: updateInsurance): Promise<Insurance> {
    return this.insurancesService.updateInsurance(body, id);
  }
  @Right('INSURANCES_DELETE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Delete(':id')
  async deleteInsurance(@Param('id') id: string): Promise<string> {
    return this.insurancesService.deleteInsurance(id);
  }
  @Right('INSURANCES_READ')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Get(':id')
  async getInsurance(@Param('id') id: string): Promise<Insurance> {
    return this.insurancesService.getById(id);
  }
}
