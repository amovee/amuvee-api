import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Param,
} from '@nestjs/common';
import { Location } from 'src/shared/schemas/location.schema';
import { LocationsService } from './locations.service';
import { LocationDTO } from 'src/shared/dtos/locations.dto';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}
  @Get()
  async getAll(
    @Query() query: { limit?: number; skip?: number },
  ): Promise<Location[]> {
    return await this.locationsService.getAll(
      query.limit ? query.limit : 20,
      query.skip ? query.skip : 0,
    );
  }
  @ApiBearerAuth('jwt')
  @Post('migrate')
  async migrate(): Promise<string> {
    await this.locationsService.migrate();
    return 'done';
  }
  @Get('counter')
  async getCounter(): // @Query() query: QueryFilterDTO
  Promise<{ filtered?: number; total: number }> {
    // query = queryFilterParser(query);
    try {
      return await this.locationsService
        .getCounter
        // query,
        ();
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('/:id') async getOne(
    @Param('id') id: number | string,
    @Query('language') language?: string,
  ): Promise<LocationDTO | undefined> {
    return this.locationsService.getLocationFromId(!+id ? id : +id, language);
  }
}
