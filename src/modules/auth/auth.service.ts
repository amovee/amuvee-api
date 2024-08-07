import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    access_token: string;
  }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException();
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) throw new UnauthorizedException();
    const token = this.jwtService.sign({
      uuid: user.uuid,
      password: user.password,
      email: user.email,
    });
    await this.usersService.updateToken(user.uuid, token);

    return {
      access_token: token,
    };
  }
}
