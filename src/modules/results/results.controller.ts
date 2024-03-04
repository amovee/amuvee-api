import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ResultsService } from './results.service';
import {
  QueryFilterDTO,
  queryFilterParser,
} from 'src/shared/dtos/query-filter.dto';
import { CreateResultDTO, ResultDTO } from 'src/shared/dtos/results.dto';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RightsGuard } from '../auth/rights/rights.guard';
import { Right } from '../auth/rights/rights.decorator';

@ApiTags('Results')
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
  
  @Get('min/counter')
  async getMinCounter(
    @Query() query: QueryFilterDTO,
  ): Promise<{ filtered?: number; total: number }> {
    query = queryFilterParser(query);
    try {
      return await this.resultsService.getMinCounter(query);
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('favorites')
  @ApiQuery({ name: 'language', required: false, type: String })
  @ApiQuery({ name: 'ids', required: true, type: String, isArray: true })
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

  @Get('/:id')
  @ApiQuery({ name: 'language', required: false, type: String })
  async getOne(
    @Param('id') id: string,
    @Query('language') language?: string,
  ): Promise<ResultDTO | undefined> {
    return this.resultsService.getResultFromId(id, language);
  }
  @Post('results/min')
  async minifyAllResults(): Promise<void> {
    await this.resultsService.minifyAllResults();
  }

  @Right('RESULTS_CREATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @Post()
  @ApiBody({ type: CreateResultDTO })
  async createResult(@Body() result: CreateResultDTO, @Request() req) {
    return this.resultsService.create(result, req.user._id);
  }
  @Right('LOCATIONS_UPDATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateResultDTO })
  @Put('/:id')
  async updateResult(
    @Body() body: CreateResultDTO,
    @Param('id') id: string,
    @Request() req
  ) {
    return this.resultsService.update(id, body, req.user._id);
  }

  @Right('RESULTS_DELETE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  //TODO: optional auch Referenzen löschen
  @Delete('/:id')
  async deleteResult(@Param('id') id: string, @Request() req) {
    this.resultsService.deleteResult(id);
  }
}
