import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { RightsGuard } from './rights.guard';

@Module({
  controllers: [AuthController],
  imports: [
    ConfigModule.forRoot(), // Needed to use process.env.SECRET
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, RightsGuard],
  exports: [AuthService],
})
export class AuthModule {}