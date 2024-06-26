import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Param,
  Body,
  Delete,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { Location } from 'src/shared/schemas/location.schema';
import { LocationsService } from './locations.service';
import {
  CreateLocationDTO,
  LocationDTO,
  UpdateLocationDTO,
} from 'src/shared/dtos/locations.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RightsGuard } from '../auth/rights/rights.guard';
import { Right } from '../auth/rights/rights.decorator';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}
  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAll(
    @Query('limit') limit = 20,
    @Query('skip') skip = 0,
    @Query('search') search,
  ): Promise<Location[]> {
    return await this.locationsService.getAll(+limit, +skip, search);
  }

  @ApiBearerAuth('jwt')
  @Post('migrate')
  async migrate(): Promise<string> {
    await this.locationsService.migrate();
    return 'done';
  }
  @Get('counter')
  @ApiQuery({ name: 'search', required: false, type: String })
  async getCounter(@Query('search') search): Promise<{ totalCount: number }> {
    try {
      return await this.locationsService.getCounter(search);
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'Die ID der Location, entweder eine MongoDB ObjectId oder eine numerische ID',
    type: String,
  })
  async getOne(@Param('id') id: string): Promise<LocationDTO | undefined> {
    return this.locationsService.getOneFromId(id);
  }

  @Right('LOCATIONS_CREATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateLocationDTO })
  @Post()
  async createLocation(@Body() body: CreateLocationDTO, @Request() req) {
    return this.locationsService.create(body, req.user._id);
  }

  @Right('LOCATIONS_UPDATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiBody({ type: UpdateLocationDTO })
  @Put('/:id')
  async updateLocation(
    @Body() body: UpdateLocationDTO,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.locationsService.update(id, body, req.user._id);
  }

  @Right('LOCATIONS_DELETE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'Die ID der Location, entweder eine MongoDB ObjectId oder eine numerische ID',
    type: String,
  })
  @Delete('/:id')
  async deleteLocation(@Param('id') id: string) {
    return this.locationsService.delete(id);
  }
}
