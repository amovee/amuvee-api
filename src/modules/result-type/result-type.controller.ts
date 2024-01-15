import { Controller, Get } from '@nestjs/common';
import { ResultTypeService } from './result-type.service';


@Controller('result-type')
export class ResultTypeController {
  constructor(private readonly resultTypeService: ResultTypeService) {}

  @Get()
  async getAll() {
    return this.resultTypeService.getAll();
  }
}
