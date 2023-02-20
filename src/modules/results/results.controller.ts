import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ResultsService } from './results.service';
import { QueryFilterDTO, queryFilterParser } from 'src/types/types.dto';
import { getFormattedResultDTO } from './results.dto';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get(':id/filters') async filters(@Param('id') id: string) {
    return await this.resultsService.getResultFilterById(id);
  }
  @Get('currentfilters') async currentfilters(@Query() query: QueryFilterDTO) {
    query = queryFilterParser(query);
    return await this.resultsService.getCurrentFilters(query);
  }
  @Get()
  async getFiltered(
    @Query() query: QueryFilterDTO,
  ): Promise<getFormattedResultDTO[]> {
    query = queryFilterParser(query);
    try {      
      return await this.resultsService.getAll(
        query.limit ? query.limit : 20,
        query.skip ? query.skip : 0,
        query,
      );
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('all')
  async getAll(
    @Query() query: {category: string, language: string},
  ): Promise<getFormattedResultDTO[]> {
    try {      
      return await this.resultsService.getAllFromCategory(query.category, query.language)
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('counter')
  async getFilteredCounter(
    @Query() query: QueryFilterDTO,
  ): Promise<{ counter: number }> {
    query = queryFilterParser(query);
    return {
      counter: await this.resultsService.getFilteredResultCount(query),
    };
  }
  @Get('/:oldId') async getOne(@Param('oldId') oldId: string, @Query('language') language: string): Promise<getFormattedResultDTO>{
    return this.resultsService.getResultFromId(oldId, language);
  }
}
