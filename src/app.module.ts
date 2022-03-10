import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    AuthModule ,
    UsersModule,
    CategoriesModule,
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
