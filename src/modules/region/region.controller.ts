import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RegionService } from './region.service';

@Controller('regions')
export class RegionController {
  constructor(
    private readonly regionService: RegionService
  ) {}
  // Auth
  @Post('migrate')
  async migration(): Promise<string> {
    return this.regionService.migrate();
  }

  // No Auth
  @Get('search/:text')
  async searchString(@Param('text') text: string, @Query('limit') limit: number = 20, @Query('skip') skip: number = 20) {
    return this.regionService.searchString(text, limit, skip);
  }

  @Get(':id')
  async getById(@Param('id') id){
    return this.regionService.getById(id)
  }
}
