import {Controller, Delete, Get, Param, Post, Query,Body, UseGuards} from '@nestjs/common';
import { Insurance } from 'src/shared/schemas/insurance.schema';
import { InsurancesService } from './insurances.service';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {Right} from "../auth/rights/rights.decorator";
import {RightsGuard} from "../auth/rights/rights.guard";
import {JwtAuthGuard} from "../auth/jwt/jwt-auth.guard";
import {createInsurance, updateInsurance} from "../../shared/dtos/insurances.dto";
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
  @Get('all')
  async getAll(): Promise<Insurance[]> {
    return this.insurancesService.getAll();
  }
  @Get('counter')
  async getCount(): Promise<{totalCount: number}> {
    return this.insurancesService.getCount();
  }

  @Get()
  async getAllInsurances(@Query('limit') limit = 20, @Query('skip') skip = 20): Promise<Insurance[]> {
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
  @ApiBearerAuth('jwt')
  @Delete(':id')
  async deleteInsurance(@Param('id') id: string) {
    return this.insurancesService.deleteInsurance(id);
  }
  @Right('INSURANCES_READ')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @Get(':id')
  async getInsurance(@Param('id') id: string): Promise<Insurance>{
    const insurance = await this.insurancesService.getById(id);
    if (insurance.name instanceof Map) {
      insurance.name = Object.fromEntries(insurance.name);
    }
    return insurance
  }

}
