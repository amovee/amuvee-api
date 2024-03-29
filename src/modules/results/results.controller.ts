import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ResultsService } from './results.service';
import {
  QueryFilterDTO,
  queryFilterParser,
} from 'src/shared/dtos/query-filter.dto';
import { ResultDTO } from 'src/shared/dtos/results.dto';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get('currentfilters') async currentfilters(@Query() query: QueryFilterDTO) {
    return this.resultsService.getMongoDBFilters(queryFilterParser(query));
  }
  @Get()
  async getFilteredResults(@Query() query: QueryFilterDTO): Promise<any[]> {
    query = queryFilterParser(query);
    try {
      return await this.resultsService.getFilteredResults(
        query.limit ? query.limit : 20,
        query.skip ? query.skip : 0,
        query,
      );
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('unwinded')
  async getUnwindedVariations(@Query() query: QueryFilterDTO): Promise<any[]> {
    query = queryFilterParser(query);
    try {
      return await this.resultsService.getUnwindedVariations(
        query.limit ? query.limit : 20,
        query.skip ? query.skip : 0,
        query,
      );
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('min')
  async getMininmalResults(@Query() query: QueryFilterDTO): Promise<any[]> {
    query = queryFilterParser(query);
    try {
      return await this.resultsService.getMinifiedResults(
        query.limit ? query.limit : 20,
        query.skip ? query.skip : 0,
        query,
      );
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('favorites')
  async getMininmalResultsFromIdList(
    @Query() query: { language: string; ids: string[] | string },
  ): Promise<any[]> {
    try {
      return await this.resultsService.getMinifiedResultsByIdList(
        query.language,
        Array.isArray(query.ids) ? query.ids : [query.ids],
      );
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('counter')
  async getCounter(
    @Query() query: QueryFilterDTO,
  ): Promise<{ filtered?: number; total: number }> {
    query = queryFilterParser(query); 
    try {
      return await this.resultsService.getCounter(query);
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('all')
  async getAll(
    @Query() query: { category: string; language: string },
  ): Promise<ResultDTO[]> {
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
  ): Promise<ResultDTO | undefined> {
    return this.resultsService.getResultFromId(id, language);
  }
}
