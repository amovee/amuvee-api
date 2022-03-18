import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { IAnswers } from 'src/shared/interfaces/answers.interface';
import { ResultsService } from './results.service';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}
  // NO AUTH
  @Get(':resultId/actions')
  async getFilteredActions(
    @Param('resultId') resultId: string,
  ): Promise<any> {
    return await this.resultsService.getFilteredActions(
      resultId
    );
  }
  
  @Get(':id/actions/min')
  async getFilteredActionsMin(
    @Param('id') id: string,
  ): Promise<any> {
    return await this.resultsService.getFilteredActions(
      id,
      true
    );
  }
  
  @Get('min')
  async getFilteredMin(
    @Param('id') id: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Body() answers: IAnswers,
  ): Promise<any> {
    return await this.resultsService.getFilteredResult(
      id,
      answers,
      Math.min(Math.max(limit, 0), 30),
      Math.max(0, offset),
      true
    );
  }
  // NO AUTH
  @Get('counter')
  async getFilteredCounter(
    @Param('id') id: string,
    @Body() answers: IAnswers,
  ): Promise<{ counter: number }> {
    return {
      counter: await this.resultsService.getFilteredResultCount(id, answers)
    };
  }
}
