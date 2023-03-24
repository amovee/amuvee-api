import { Controller, Get, Post, Query } from '@nestjs/common';
import { Location } from './location.schema';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(
    private readonly locationsService: LocationsService
  ) {}
  @Get()
  async getAll(
    @Query() query: { limit?: number; skip?: number },
  ): Promise<Location[]> {
    return await this.locationsService.getAll(
      query.limit ? query.limit : 20,
      query.skip ? query.skip : 0,
    );
  }
  @Post('migrate')
  async migrate(): Promise<string> {
    await this.locationsService.migrate();
    return 'done';
  }
}
