import { Controller, Get } from '@nestjs/common';
import { Meta } from 'src/shared/schemas/meta.schema';
import { ResultTypesService } from './result-types.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('result-types')
@Controller('result-types')
export class ResultTypesController {
    constructor(
      private readonly resultTypesService: ResultTypesService,
    ) {}
    // No Auth but filtered
    @Get()
    async findAll(): Promise<Meta[]> {
      return (await this.resultTypesService.findAll());
    }}
