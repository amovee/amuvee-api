import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Action } from 'rxjs/internal/scheduler/Action';
import { ActionDocument } from 'src/shared/schemas/action.schema';
import { Model } from 'mongoose';

@Injectable()
export class ActionsService {
  constructor(
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
  ) {}
}
