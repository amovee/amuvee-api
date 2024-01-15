import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Post,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { EventDTO } from 'src/shared/dtos/events.dto';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class ResultsController {
  constructor(private readonly eventsService: EventsService) {}
  @Get()
  async getEvents(filter: { month: number; year: number }): Promise<EventDTO[]> {
    try {
      return this.eventsService.getEvents(filter);
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('nextTwoDistinct')
  async getNextTwoDistinctTypeEvents(): Promise<EventDTO[]> {
    const currentTimestamp = new Date();
    const events = await this.eventsService.getNextTwoDistinctTypeEvents(currentTimestamp);
    return events;
  }
  @ApiBearerAuth('jwt')
  @Post('migrate')
  async migrate(): Promise<void> {
    await this.eventsService.migrate();
  }
  @Get('list')
  async getEventList(
    @Query() query: { limit: number; skip: number },
  ): Promise<any[]> {
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
  async getCount(): Promise<number> {
    try {
      return await this.eventsService.countEvents();
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
}
