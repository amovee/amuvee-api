import { Controller, Request, Post, UseGuards, Query, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}
  
  // @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Query() req) {
    return this.authService.login(req.name, req.password);
  }
  @UseGuards(JwtAuthGuard)
  @Get('test')
  async test(){
    return 'test'
  }
}
