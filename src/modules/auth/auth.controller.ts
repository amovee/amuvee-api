import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiBody, ApiResponse} from '@nestjs/swagger';
import { LoginDTO } from '../../shared/dtos/types.dto';

@ApiTags('_Auths')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}
  // hide from swagger
  @ApiBody({ type: LoginDTO })
  @ApiResponse({ status: 200, description: 'JWT token' })
  @Post('login')
  async login(@Body() req) {
    return this.authService.login(req.email, req.password);
  }
}
