import { Controller, Get, Param, Post } from '@nestjs/common';
import { RegionService } from './region.service';

@Controller('regions')
export class RegionController {
  constructor(
    private readonly regionService: RegionService
  ) {}
  // Auth
  @Post('migrate')
  async migration(): Promise<string> {
    this.regionService.migrate();
    return 'done';
  }

  // No Auth
  @Get('search/:text')
  async searchString(@Param('text') text: string) {
    return this.regionService.searchString(text);
  }
}
