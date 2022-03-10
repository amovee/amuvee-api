import { Controller, Get } from '@nestjs/common';

@Controller()
export class ActionsController {
  constructor() {}
  @Get()
  getHello(): string {
    return 'hello';
  }
}
