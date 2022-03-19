import { Controller, Get } from '@nestjs/common';
import { ActionsService } from './actions.service';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('actions')
@Controller('actions')
export class ActionsController {
  constructor(public readonly actionsService: ActionsService) {}
  @Get()
  getHello(): string {
    return 'hello';
  }
}
