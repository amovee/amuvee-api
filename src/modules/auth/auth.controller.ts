import { Controller, Post, UseGuards, Query, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Right } from './rights.decorator';
import { RightsGuard } from './rights.guard';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}
  
  // @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Query() req) {
    return this.authService.login(req.email, req.password);
  }
  // @Right("EVENTS_DELETE")
  // @UseGuards(JwtAuthGuard, RightsGuard)
  // @Get('test')
  // async test(){
  //   return 'test'
  // }
}
