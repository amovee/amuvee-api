import {Controller, Get, Delete, Param, Post, Query, Put} from '@nestjs/common';
import { ActionsService } from './actions.service';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';

@ApiTags('Actions')
@Controller('actions')
export class ActionsController {
  constructor(public readonly actionsService: ActionsService) {}
  @ApiBearerAuth('JWT-auth')
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
  @Get()
  getAll(@Query('limit') limit?: number, @Query('skip') skip?: number) {
    return this.actionsService.getAll(+limit ? +limit : 1000, +skip ? +skip : 0);
  }
  @Delete(':id')
  deleteAction(@Param('id') id: number) {
    return this.actionsService.deleteAction(id);
  }
  @Get(':id')
  getAction(@Param('id') id: number) {
    return this.actionsService.getAction(id);
  }
  @Put(':id')
  updateAction(@Param('id') id: number, @Query('name') name: string) {
    return this.actionsService.updateAction(id, name);
  }
  @Post()
  createAction(@Query('name') name: string) {
    return this.actionsService.createAction(name);
  }
  @Get('count')
  getCount() {
    return this.actionsService.getCount();
  }
}
