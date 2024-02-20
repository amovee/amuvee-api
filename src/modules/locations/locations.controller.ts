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
  Put
} from '@nestjs/common';
import { Location } from 'src/shared/schemas/location.schema';
import { LocationsService } from './locations.service';
import { CreateLocationDTO, LocationDTO, UpdateLocationDTO } from 'src/shared/dtos/locations.dto';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RightsGuard } from '../auth/rights/rights.guard';
import { Right } from '../auth/rights/rights.decorator';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) { }
  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number})
  @ApiQuery({ name: 'skip', required: false, type: Number })
  async getAll(
    @Query() query: { limit?: number; skip?: number },
  ): Promise<Location[]> {
    return await this.locationsService.getAll(
      query.limit ? query.limit : 20,
      query.skip ? query.skip : 0,
    );
  }


  @Get('search')
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  async searchEvents(
    @Query() query: { query: string; limit: number; skip: number },
  ): Promise<Location[]> {
    return this.locationsService.search(query.query, query.limit, query.skip);
  }

  @ApiBearerAuth('jwt')
  @Post('migrate')
  async migrate(): Promise<string> {
    await this.locationsService.migrate();
    return 'done';
  }
  @Get('counter')
  async getCounter(): Promise<{ totalCount: number }> {
    try {
      return await this.locationsService.getCounter();
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Die ID der Location, entweder eine MongoDB ObjectId oder eine numerische ID',
    type: String
  })
  async getOne(
    @Param('id') id: string
  ): Promise<LocationDTO | undefined> {
    return this.locationsService.getOneFromId(id);
  }

  @Right('LOCATIONS_CREATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateLocationDTO })
  @Post()
  async createLocation(
    @Body() body: CreateLocationDTO,
    @Request() req
  ) {
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
    @Request() req
  ) {
    return this.locationsService.update(id, body, req.user._id);
  }

  @Right('LOCATIONS_DELETE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Die ID der Location, entweder eine MongoDB ObjectId oder eine numerische ID',
    type: String
  })

  @Delete('/:id')
  async deleteLocation(@Param('id') id: string) {
    return this.locationsService.delete(id);
  }
}
