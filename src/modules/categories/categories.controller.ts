import { Controller, Get } from '@nestjs/common';

@Controller()
export class CategoriesController {
  constructor() {}
  @Get()
  getHello(): string {
    return 'hello';
  }
}
