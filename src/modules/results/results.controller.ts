import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { Answers } from 'src/shared/interfaces/answers.interface';
import { ResultsService } from './results.service';

@Controller('/categories/:id/results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}
  @Get()
  async getFiltered(
    @Param('id') id: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Body() answers: Answers
  ): Promise<any> {
    const clamp = (min: number, num: number, max: number) =>
      Math.min(Math.max(num, min), max);
    return await this.resultsService.getFilteredResult(
      id,
      answers,
      clamp(0, limit, 30),
      Math.max(0, offset),
    );
  }
}
