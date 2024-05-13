import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt/jwt.strategy';
import { RightsGuard } from './rights/rights.guard';

@Module({
  controllers: [AuthController],
  imports: [
    ConfigModule.forRoot(), // Needed to use process.env.SECRET
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: '1y' },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RightsGuard
  ],
  exports: [AuthService],
})
export class AuthModule {}
