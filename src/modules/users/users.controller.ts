import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IUser } from 'src/shared/interfaces/user.interface';
import { User } from 'src/shared/schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createUser(@Request() req, @Body() body: IUser): Promise<User> {
    return this.usersService.createUser(req.user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // TODO: update password
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(): Promise<User> {
    return null;
  }
  @UseGuards(JwtAuthGuard)
  @Post(':id/password')
  async updateUserPassword(
    @Param('id') id: string,
    @Body() body: any,
  ): Promise<void> {
    this.usersService.updateUserPassword(id, body);
    // TODO: return value
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Request() req, @Param('id') id: string): Promise<void> {
    this.usersService.deleteOne(req.user, id);
    // TODO: return value
  }
}
