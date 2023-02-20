import { Controller, Post } from '@nestjs/common';
import { ActionsService } from './actions.service';

@Controller('actions')
export class ActionsController {
  constructor(public readonly actionsService: ActionsService) {}
  @Post('migrate')
  migrate() {
    this.actionsService.migrate();
    return 'done';
  }
}
