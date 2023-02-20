// import { IAnswers } from 'src/types/types.dto';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Region } from '../../schemas/region.schema';
import { RegionService } from './region.service';

@Controller('regions')
export class RegionController {
  constructor(
    private readonly regionService: RegionService
  ) {}
  // No Auth
  @Post('migrate')
  async migration(): Promise<string> {
    this.regionService.migrate();
    return 'done';
  }

  @Get('search/:text')
  async searchString(@Param('text') text: string) {
    return this.regionService.searchString(text);
  }
}
