import { Controller, Get } from '@nestjs/common';

@Controller()
export class UsersController {
  constructor() {}
  @Get()
  getHello(): string {
    return 'hello';
  }
}
