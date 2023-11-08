import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { InsurancesModule } from './modules/insurances/insurances.module';
import { LocationsModule } from './modules/locations/locations.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { RouterModule } from '@nestjs/core';
import { RegionModule } from './modules/region/region.module';
import { UsersModule } from './modules/users/users.module';
import { ResultsModule } from './modules/results/results.module';
import { MigrationModule } from './modules/migration/migration.module';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { MiddlewareConsumer } from '@nestjs/common/interfaces/middleware';
import { ConfigModule } from '@nestjs/config';
import { CountersModule } from './modules/counters/counters.module';
import { EventsModule } from './modules/events/events.module';
import { MailerController } from './mailer/mailer.controller';
import { MailerModule } from './mailer/mailer.module';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: any) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
  }
}
@Module({
  imports: [
    ConfigModule.forRoot(),
    CountersModule,
    InsurancesModule,
    LocationsModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ResultsModule,
    MigrationModule,
    RegionModule,
    EventsModule,
    RouterModule.register([
      {
        path: '/users',
        module: UsersModule,
      },
    ]),
    MongooseModule.forRoot(
      process.env.MODE == 'LOCAL'
        ? process.env.MONGODB_LOCAL_URL
        : process.env.MONGODB_DOCKER_URL,
    ),
    MailerModule,
  ],
  controllers: [AppController, MailerController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AppController);
  }
}
