import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}
  @Post('login')
  async login(@Body() req) {
    return this.authService.login(req.email, req.password);
  }
}
