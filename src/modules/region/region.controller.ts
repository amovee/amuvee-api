import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Body,
  UseGuards,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { RegionService } from './region.service';
import {ApiBearerAuth, ApiQuery, ApiTags} from '@nestjs/swagger';
import {Right} from "../auth/rights/rights.decorator";
import {JwtAuthGuard} from "../auth/jwt/jwt-auth.guard";
import {RightsGuard} from "../auth/rights/rights.guard";
import {RegionDTO, createRegionDTO, updateRegionDTO} from "../../shared/dtos/region.dto";


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

  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number})
  @ApiQuery({ name: 'skip', required: false, type: Number })
  async getAll(@Query('limit') limit = 20, @Query('skip') skip = 0) {
    return this.regionService.getAll(limit, skip);
  }

  @Get('counter')
  async count(): Promise<{totalCount: number}> {
    return this.regionService.count();
  }

  @Get('search')
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  async searchRigoin(
    @Query() query: { query: string; limit: number; skip: number },
  ): Promise<any[]> {
    if (query.limit > 40)
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    try {
      return await this.regionService.searchString(query.query, query.limit, query.skip);
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }

  @Right('REGIONS_CREATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Post()
  async createRegion(@Body() region: createRegionDTO) {
    return this.regionService.createRegion(region);
  }

  @Right('REGIONS_DELETE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Delete(':id')
  async deleteById(@Param('id') id: string): Promise<RegionDTO> {
    return this.regionService.deleteById(id);
  }

  @Right('REGIONS_UPDATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Put(':id')
  async updateById(@Param('id') id: string, @Body() region: updateRegionDTO) {
    return this.regionService.updateById(id, region);
  }

  @Get(':id')
  async getById(@Param('id') id){
    return this.regionService.getById(id)
  }
}

