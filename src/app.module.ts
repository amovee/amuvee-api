import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MigrationModule } from './modules/migration/migration.module';
import { ResultsModule } from './modules/results/results.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    AuthModule ,
    UsersModule,
    CategoriesModule,
    ResultsModule,
    MigrationModule,
    RouterModule.register([
      {
        path: '/users',
        module: UsersModule,
      },
    ]),
    MongooseModule.forRoot('mongodb://localhost/amuvee')
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
