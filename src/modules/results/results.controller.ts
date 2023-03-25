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

  @Get('currentfilters') async currentfilters(@Query() query: QueryFilterDTO) {
    return this.resultsService.getMongoDBFilters(queryFilterParser(query));
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
  @Get('counter')
  async getCounter(
    @Query() query: QueryFilterDTO
  ): Promise<any> {
    query = queryFilterParser(query);
    try {
      return await this.resultsService.getCounter(
        query,
      );
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('all')
  async getAll(
    @Query() query: { category: string; language: string },
  ): Promise<getFormattedResultDTO[]> {
    try {
      return await this.resultsService.getAllFromCategory(
        query.category,
        query.language,
      );
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/:id') async getOne(
    @Param('id') id: string,
    @Query('language') language?: string,
  ): Promise<getFormattedResultDTO> {
    return this.resultsService.getResultFromId(id, language);
  }
}
