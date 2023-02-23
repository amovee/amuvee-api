// import { IUser } from 'src/types/types.dto';
import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  Query,
  Get
} from '@nestjs/common';
import { User } from '../../schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Right } from '../auth/rights.decorator';
import { RightsGuard } from '../auth/rights.guard';
import { UpdatePasswordDTO } from './update-password.dt';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Request() req, @Body() body: User): Promise<void> {
    // return this.usersService.createUser(req.user, body);
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
  @Right('USERS_GET')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
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
    @Request() req
  ): Promise<boolean> {
    return this.usersService.updateUserPassword(query, req.user.email);
  }

  // @UseGuards(JwtAuthGuard)
  // @Delete(':id')
  // async deleteUser(@Request() req, @Param('id') id: string): Promise<void> {
  //   this.usersService.deleteOne(req.user, id);
  //   // TODO: return value
  // }
}
