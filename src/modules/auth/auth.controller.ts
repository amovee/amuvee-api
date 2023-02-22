import { Controller, Post, UseGuards, Query, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './role.decorator';
import { Role } from './role.enum';
import { RolesGuard } from './roles.guard';

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
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('test')
  async test(){
    return 'test'
  }
}
