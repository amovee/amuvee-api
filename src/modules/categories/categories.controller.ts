import { Body,Req, Controller, Get, Post, Param, Query } from '@nestjs/common';
import { IAnswers } from 'src/shared/interfaces/answers.interface';
import { Category } from 'src/shared/schemas/category.schema';
import { ResultsService } from '../results/results.service';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly resultsService: ResultsService,
  ) {}
  // No Auth
  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }
  @Get('min')
  async findAllMin(): Promise<Category[]> {
    return this.categoriesService.findAll(true);
  }
  @Get(':id/results')
  async getFiltered(
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
    );
  }
  @Get(':id/results/min')
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
}
