import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { Answers } from 'src/shared/interfaces/answers.interface';
import { ResultsService } from './results.service';

@Controller('/categories/:id/results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}
  // NO AUTH
  @Get()
  async getFiltered(
    @Param('id') id: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Body() answers: Answers,
  ): Promise<any> {
    return await this.resultsService.getFilteredResult(
      id,
      answers,
      Math.min(Math.max(limit, 0), 30),
      Math.max(0, offset),
    );
  }
  @Get('min')
  async getFilteredMin(
    @Param('id') id: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Body() answers: Answers,
  ): Promise<any> {
    return await this.resultsService.getFilteredResult(
      id,
      answers,
      Math.min(Math.max(limit, 0), 30),
      Math.max(0, offset),
      {
        dateUpdated: 0,
        userUpdated: 0,
        dateCreated: 0,
        userCreated: 0,
        status: 0,
        oldId: 0,
        filter: 0,
      },
    );
  }
  // NO AUTH
  @Get('counter')
  async getFilteredCounter(
    @Param('id') id: string,
    @Body() answers: Answers,
  ): Promise<{ counter: number }> {
    return {
      counter: await this.resultsService.getFilteredResultCount(id, answers),
    };
  }
}
