import {Controller, Get, Delete, Param, Post, Query, Put} from '@nestjs/common';
import { ActionsService } from './actions.service';
import {ApiBearerAuth, ApiBody, ApiQuery, ApiTags} from '@nestjs/swagger';
import {createActionsDTO} from "../../shared/dtos/actions.dto";
import {Right} from "../auth/rights/rights.decorator";
import {RightsGuard} from "../auth/rights/rights.guard";
import {JwtAuthGuard} from "../auth/jwt/jwt-auth.guard";
import {UseGuards} from "@nestjs/common";

@ApiTags('Actions')
@Controller('actions')
export class ActionsController {
  constructor(public readonly actionsService: ActionsService) {}

  @Right('ACTIONS_READ')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @Post('migrate')
  migrate() {
    this.actionsService.migrate();
    return 'done';
  }
  @Get(':id/results')
  @ApiQuery({ name: 'limit', required: false, type: Number})
  @ApiQuery({ name: 'skip', required: false, type: Number })
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
  @ApiQuery({ name: 'limit', required: false, type: Number})
  @ApiQuery({ name: 'skip', required: false, type: Number })
  getAll(@Query('limit') limit?: number, @Query('skip') skip?: number) {
    return this.actionsService.getAll(+limit ? +limit : 1000, +skip ? +skip : 0);
  }
  @Get('count')
  async getCount(): Promise<{totalCount: number}> {
    return await this.actionsService.getCount() ;
  }

  @Right('ACTIONS_READ')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @Delete(':id')
  deleteAction(@Param('id') id: string) {
    return this.actionsService.deleteAction(id);
  }
  @Get(':id')
  getAction(@Param('id') id: string) {
    return this.actionsService.getAction(id);
  }
  @Right('ACTIONS_READ')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiBody({type: createActionsDTO})
  @Put(':id')
  updateAction(@Param('id') id: string, @Query('name') name: string) {
    return this.actionsService.updateAction(id, name);
  }
  @Right('ACTIONS_READ')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiBody({type: createActionsDTO})
  @Post()
  createAction(@Query('name') name: string) {
    return this.actionsService.createAction(name);
  }

}
