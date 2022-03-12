import { Controller, Get, Param } from '@nestjs/common';

@Controller('/categories/:id/results')
export class ResultsController {
  constructor() {}
  @Get()
  getHello(@Param('id') id: string): string {
    return 'hello_'+id;
  }
}
