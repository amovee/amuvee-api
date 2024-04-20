import {
  Controller,
  Get,
  Delete,
  Param,
  Post,
  Query,
  Put,
  Body,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateActionsDTO } from '../../shared/dtos/actions.dto';
import { Right } from '../auth/rights/rights.decorator';
import { RightsGuard } from '../auth/rights/rights.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('Actions')
@Controller('actions')
export class ActionsController {
  constructor(public readonly actionsService: ActionsService) {}

  @Right('ACTIONS_CREATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @Post('migrate')
  migrate() {
    this.actionsService.migrate();
    return 'done';
  }
  @Get('counter')
  async getCounter(): Promise<{ totalCount: number }> {
    try {
      return await this.actionsService.getCount();
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get(':id/results/counter') //TODO: move to results
  getMentionsCounter(@Param('id') id: string) {
    return this.actionsService.getMentionsCounter(id);
  }
  @Get(':id/results') //TODO: move to results
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  getMentions(
    @Param('id') id: string,
    @Query('limit') limit = 20,
    @Query('skip') skip = 0,
  ) {
    return this.actionsService.getMentions(id, limit, skip);
  }

  @Get(':id')
  getAction(@Param('id') id: string) {
    return this.actionsService.getAction(id);
  }
  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  getAll(
    @Query('limit') limit = 20,
    @Query('skip') skip = 0,
    @Query('search') search,
  ) {
    try {
      if (search && search.length > 40)
        throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
      return this.actionsService.getAll(limit, skip, search);
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Right('ACTIONS_DELETE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @Delete(':id')
  deleteAction(@Param('id') id: string) {
    return this.actionsService.deleteAction(id);
  }
  @Right('ACTIONS_UPDATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateActionsDTO })
  @Put(':id')
  updateAction(
    @Body() body: CreateActionsDTO,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.actionsService.update(id, body, req.user._id);
  }
  @Right('ACTIONS_CREATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateActionsDTO })
  @Post()
  createAction(@Body() body: CreateActionsDTO, @Request() req) {
    return this.actionsService.create(body, req.user._id);
  }
}
