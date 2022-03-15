import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from 'src/shared/schemas/category.schema';
import { Insurance, InsuranceSchema } from 'src/shared/schemas/insurance.schema';
import { Location, LocationSchema } from 'src/shared/schemas/location.schema';
import { MetaSchema } from 'src/shared/schemas/meta.schema';
import { Region, RegionSchema } from 'src/shared/schemas/region.schema';
import { Result, ResultSchema } from 'src/shared/schemas/result.schema';
import { User, UserSchema } from 'src/shared/schemas/user.schema';
import { MigrationController } from './migration.controller';
import { MigrationService } from './migration.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Result.name, schema: ResultSchema },
      { name: 'ResultType', schema: MetaSchema },
      { name: 'RelationshipType', schema: MetaSchema },
      { name: 'JobRelatedSituation', schema: MetaSchema },
      { name: Insurance.name, schema: InsuranceSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Region.name, schema: RegionSchema },
    ]),
  ],
  controllers: [MigrationController],
  providers: [MigrationService],
})
export class MigrationModule {}
