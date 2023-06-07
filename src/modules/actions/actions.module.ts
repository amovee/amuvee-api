import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/shared/schemas/user.schema';
import { CountersModule } from '../counters/counters.module';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { Action, ActionSchema } from 'src/shared/schemas/action.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Action.name, schema: ActionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CountersModule
  ],
  controllers: [ActionsController],
  providers: [ActionsService],
  exports: [ActionsService],
})
export class ActionsModule {}