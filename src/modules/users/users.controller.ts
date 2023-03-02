// import { IUser } from 'src/types/types.dto';
import {
  Body,
  Controller,
  Post,
  Put,
  Request,
  UseGuards,
  Query,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { User } from '../../schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Right } from '../auth/rights.decorator';
import { RightsGuard } from '../auth/rights.guard';
import { createUserDTO, UpdatePasswordDTO, updateUserDTO } from './user.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Right('USERS_CREATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Post()
  async createUser(@Body() body: createUserDTO): Promise<{ password: string }> {
    return { password: await this.usersService.createUser(body) };
  }
  @Post('migrate')
  async migrate(): Promise<string> {
    await this.usersService.migrate();
    return 'done';
  }

  // @UseGuards(JwtAuthGuard)
  // @Get(':id')
  // async getUser(@Param('id') id: string): Promise<User> {
  //   return this.usersService.findOneById(id);
  // }
  @Right('USERS_UPDATE') // TODO auch für eigenen account erlauben
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Put(':id/password')
  async generateNewPassword(
    @Param('id') id: string,
  ): Promise<{ password: string }> {
    return { password: await this.usersService.regeneratePassword(id) };
  }
  @Right('USERS_READ')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }
  @UseGuards(JwtAuthGuard)
  @Get('account')
  async getAccount(@Request() req): Promise<User> {
    if (req.hasOwnProperty('user') && req['user'].email) {
      const user = await this.usersService.findOneByEmail(req['user'].email);
      return {
        _id: user._id,
        isAdmin: user.isAdmin,
        rights: user.rights,
        email: user.email,
        oldId: user.oldId,
        name: user.name,
      };
    }
    throw new UnauthorizedException();
  }

  // // TODO: update password
  // @UseGuards(JwtAuthGuard)
  // @Put(':id')
  // async updateUser(): Promise<User> {
  //   return null;
  // }
  @UseGuards(JwtAuthGuard)
  @Put('password')
  async updateUserPassword(
    @Query() query: UpdatePasswordDTO,
    @Request() req,
  ): Promise<boolean> {
    return this.usersService.updateUserPassword(query, req.user.email);
  }

  @Right('USERS_UPDATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() changes: updateUserDTO
  ): Promise<void> {
    return this.usersService.updateOne(id, changes);
  }

  @Right('USERS_DELETE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Delete(':id')
  async deleteUser(@Request() req, @Param('id') id: string): Promise<void> {
    this.usersService.deleteOne(req.user.email, id);
    // TODO: return value
  }
}
