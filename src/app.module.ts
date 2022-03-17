import { InsurancesModule } from './modules/insurances/insurances.module';
import { ResultTypesModule } from './modules/result-types/result-types.module';
import { RelationshipTypesModule } from './modules/relationship-types/relationship-types.module';
import { LocationsModule } from './modules/locations/locations.module';
import { LocationsController } from './modules/locations/locations.controller';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { JobSituationsModule } from './modules/job-situations/job-situation.module';
import { MigrationModule } from './modules/migration/migration.module';
import { ResultsModule } from './modules/results/results.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    InsurancesModule,
    ResultTypesModule,
    RelationshipTypesModule,
    LocationsModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ResultsModule,
    MigrationModule,
    JobSituationsModule,
    RouterModule.register([
      {
        path: '/users',
        module: UsersModule,
      },
    ]),
    MongooseModule.forRoot('mongodb://localhost/amuvee'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
