import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDTO } from 'src/types/types.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {
    // console.log(jwtService.sign({test: 'test'}));
    // bcrypt.hash('test', 10).then(res=>{
    //   console.log(res);
    //   bcrypt.compare('bla', res).then((res: any) => {
    //     console.log(res);
    //   })
    // })
    // console.log(jwtService.sign({test: 'bla'}));
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByName(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async login(
    name: string,
    password: string
  ): Promise<{
    access_token: string;
  }> {
    const user = await this.usersService.findOneByName(name);    
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'wrong passort ore username',
        },
        HttpStatus.FORBIDDEN
      );
    }
    const token = this.jwtService.sign({
      name: user.name,
      password: user.password,
    });
    this.usersService.updateToken(user._id, token);
    
    return {
      access_token: token,
    };
    // if (user && user.password === password) {
    //   return user;
    // }
    // this.usersService
    // const payload = { name, password };
  }
}
