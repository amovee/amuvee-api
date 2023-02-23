import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Action, ActionSchema } from './action.schema';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Action.name, schema: ActionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ActionsController],
  providers: [ActionsService],
  exports: [ActionsService],
})
export class ActionsModule {}