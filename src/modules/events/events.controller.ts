import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Post,
  Body,
  Request,
  UseGuards,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { EventsService } from './events.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Event } from 'src/shared/schemas/event.schema';
import {
  CreateEventDTO,
  EventDTO,
  UpdateEventDTO,
} from 'src/shared/dtos/events.dto';
import { Right } from '../auth/rights/rights.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RightsGuard } from '../auth/rights/rights.guard';

@ApiTags('Events')
@Controller('events')
export class ResultsController {
  constructor(private readonly eventsService: EventsService) {}
  @Get('for_month')
  async getEvents(
    @Query() filter: { month: number; year: number },
  ): Promise<Event[]> {
    try {
      return this.eventsService.getEvents(filter);
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('nextTwoDistinct')
  async getNextTwoDistinctTypeEvents(): Promise<Event[]> {
    const currentTimestamp = new Date();
    const events =
      await this.eventsService.getNextTwoDistinctTypeEvents(currentTimestamp);
    return events;
  }
  @ApiBearerAuth('jwt')
  @Post('migrate')
  async migrate(): Promise<void> {
    await this.eventsService.migrate();
  }
  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  async getEventList(
    @Query() query: { limit: number; skip: number },
  ): Promise<any[]> {
    if (query.limit > 40)
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    try {
      return await this.eventsService.getListByLimitAndSkip(
        query.skip ? +query.skip : 0,
        query.limit ? +query.limit : 20,
      );
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('counter')
  async getCount(): Promise<{totalCount: number}> {
    try {
      return await this.eventsService.countEvents();
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Right('EVENTS_CREATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateEventDTO })
  @Post()
  async createEvent(@Body() event: CreateEventDTO, @Request() req) {
    return this.eventsService.create(event, req.user._id);
  }

  @Get('/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'Die ID des Events, entweder eine MongoDB ObjectId oder eine numerische ID',
    type: String,
  })
  async getOne(@Param('id') id: string): Promise<EventDTO | undefined> {
    return this.eventsService.getOneFromId(id);
  }

  @Right('EVENTS_UPDATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiBody({ type: UpdateEventDTO })
  @Put('/:id')
  async updateEvent(
    @Body() body: UpdateEventDTO,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.eventsService.update(id, body, req.user._id);
  }

  @Right('EVENTS_DELETE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  @Delete('/:id')
  async deleteEvent(@Param('id') id: string) {
    return this.eventsService.delete(id);
  }
}
