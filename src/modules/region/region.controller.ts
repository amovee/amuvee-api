import {Controller, Delete, Get, Param, Post,Put, Query, Body, UseGuards} from '@nestjs/common';
import { RegionService } from './region.service';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {Right} from "../auth/rights/rights.decorator";
import {JwtAuthGuard} from "../auth/jwt/jwt-auth.guard";
import {RightsGuard} from "../auth/rights/rights.guard";
import {createRegionDTO, updateRegionDTO} from "../../shared/dtos/region.dto";


@ApiTags('Regions')
@Controller('regions')
export class RegionController {
  constructor(
    private readonly regionService: RegionService
  ) {}
  // Auth
  @ApiBearerAuth('jwt')
  @Post('migrate')
  async migration(): Promise<string> {
    return this.regionService.migrate();
  }

  // @Right('REGIONS_READ')
  // @UseGuards(JwtAuthGuard, RightsGuard)
  @Get()
  async getAll(@Query('limit') limit = 20, @Query('skip') skip = 0) {

    return this.regionService.getAll(limit, skip);
  }
  @Right('REGIONS_DELETE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Delete(':id')
  async deleteById(@Param('id') id: string) {
    return this.regionService.deleteById(id);
  }

  @Right('REGIONS_UPDATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Put(':id')
  async updateById(@Param('id') id: string, @Body() region: updateRegionDTO) {
    return this.regionService.updateById(id, region);
  }
  @Right('REGIONS_CREATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Post()
  async createRegion(@Body() region: createRegionDTO) {
    return this.regionService.createRegion(region);
  }
  @Get('search/:text')
  async searchString(@Param('text') text: string, @Query('limit') limit = 20, @Query('skip') skip = 20) {
    return this.regionService.searchString(text, limit, skip);
  }
  @Get('count')
  async count() {
    return this.regionService.count();
  }
  @Get(':id')
  async getById(@Param('id') id){
    return this.regionService.getById(id)
  }
}

