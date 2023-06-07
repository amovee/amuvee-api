
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { right } from 'src/types/rights';
import { RIGHT_KEY } from './rights.decorator';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class RightsGuard implements CanActivate {
  constructor(private reflector: Reflector, private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRight = this.reflector.getAllAndOverride<right>(RIGHT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRight) {
      return true;
    }
    const request = context.switchToHttp().getRequest();    
    const user = request.user;    
    return await this.usersService.checkUserHasRight(requiredRight, user.email);
  }
}
