import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { RolesGuard } from './modules/auth/role.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  @Get()
  @UseGuards(RolesGuard)
  getHello(): string {
    return this.appService.getHello();
  }
}
