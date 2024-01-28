import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/shared/schemas/user.schema';
import { Category, CategorySchema } from 'src/shared/schemas/category.schema';
import { ResultsModule } from '../results/results.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CountersModule } from '../counters/counters.module';
import { UsersModule } from '../users/users.module';
import { Result, ResultSchema } from 'src/shared/schemas/result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: User.name, schema: UserSchema },
      { name: Result.name, schema: ResultSchema },
    ]),
    ResultsModule,
    CountersModule,
    UsersModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}