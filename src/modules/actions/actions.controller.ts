import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ActionsService } from './actions.service';

@Controller('actions')
export class ActionsController {
  constructor(public readonly actionsService: ActionsService) {}
  @Post('migrate')
  migrate() {
    this.actionsService.migrate();
    return 'done';
  }
  @Get(':id/results')
  getMentions(
    @Param('id') id: number,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    return this.actionsService.getMentions(
      id,
      +limit ? +limit : 1000,
      +skip ? +skip : 0,
    );
  }
}
