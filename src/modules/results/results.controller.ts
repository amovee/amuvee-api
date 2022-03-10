import { Controller, Get } from '@nestjs/common';

@Controller()
export class ResultsController {
  constructor() {}
  @Get()
  getHello(): string {
    return 'hello';
  }
}
