import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from 'src/shared/schemas/category.schema';
import { User, UserSchema } from 'src/shared/schemas/user.schema';
import { MigrationController } from './migration.controller';
import { MigrationService } from './migration.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Category.name, schema: CategorySchema }])],
  controllers: [MigrationController],
  providers: [MigrationService],
})
export class MigrationModule {}