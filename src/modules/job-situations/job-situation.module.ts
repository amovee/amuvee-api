import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from 'src/shared/schemas/category.schema';
import { MetaSchema } from 'src/shared/schemas/meta.schema';
import { JobSituationsController } from './job-situation.controller';
import { JobSituationsService } from './job-situation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: 'JobRelatedSituation', schema: MetaSchema },
    ]),
  ],
  controllers: [JobSituationsController],
  providers: [JobSituationsService],
})
export class JobSituationsModule {}
