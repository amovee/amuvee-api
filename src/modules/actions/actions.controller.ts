import {Controller, Get, Delete, Param, Post, Query, Put} from '@nestjs/common';
import { ActionsService } from './actions.service';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {createActionsDTO} from "../../shared/dtos/actions.dto";

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
  @Get('count')
  async getCount(): Promise<{totalCount: number}> {
    return await this.actionsService.getCount() ;
  }
  @Delete(':id')
  deleteAction(@Param('id') id: string) {
    return this.actionsService.deleteAction(id);
  }
  @Get(':id')
  getAction(@Param('id') id: string) {
    return this.actionsService.getAction(id);
  }

  @ApiBody({type: createActionsDTO})
  @Put(':id')
  updateAction(@Param('id') id: string, @Query('name') name: string) {

    return this.actionsService.updateAction(id, name);
  }

  @ApiBody({type: createActionsDTO})
  @Post()
  createAction(@Query('name') name: string) {
    return this.actionsService.createAction(name);
  }

}
