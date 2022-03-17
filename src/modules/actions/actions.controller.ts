import { Controller, Get } from '@nestjs/common';
import { ActionsService } from './actions.service';

@Controller()
export class ActionsController {
  constructor(public readonly actionsService: ActionsService) {}
  @Get()
  getHello(): string {
    return 'hello';
  }
}
