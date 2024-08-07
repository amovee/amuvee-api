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
  HttpStatus,
} from '@nestjs/common';
import { HttpException, UnauthorizedException } from '@nestjs/common/exceptions';
import { User } from 'src/shared/schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Right } from '../auth/rights/rights.decorator';
import { RightsGuard } from '../auth/rights/rights.guard';
import { UsersService } from './users.service';
import { UpdatePasswordDTO, createUserDTO, updateUserDTO, AddRolesDto } from 'src/shared/dtos/user.dto';
import {ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger';

@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Get('/account')
  async getAccount(@Request() req): Promise<User> {
    if (req.hasOwnProperty('user') && req['user'].email) {
      const user = await this.usersService.findOneByEmail(req['user'].email);
      return {
        _id: user._id,
        uuid: user.uuid,
        isAdmin: user.isAdmin,
        rights: user.rights,
        email: user.email,
        oldId: user.oldId,
        name: user.name,
        roles: user.roles,
      };
    }
    throw new UnauthorizedException();
  }

  @Right('USERS_READ')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @Get('/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'Die ID des Users',
    type: String,
  })
  async getOneUser(
    @Param('id') id: string,
  ): Promise<User | undefined> {
    try {
      return this.usersService.findOne(id);
    } catch (error) {
      new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  @Right('USERS_CREATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @Post()
  async createUser(@Body() body: createUserDTO): Promise<{ password: string }> {
    return { password: await this.usersService.createUser(body) };
  }
  @ApiBearerAuth('jwt')
  @Post('migrate')
  async migrate(): Promise<string> {
    await this.usersService.migrate();
    return 'done';
  }

  @Right('USERS_UPDATE') // TODO auch für eigenen account erlauben
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @Put(':id/password')
  async generateNewPassword(
    @Param('id') id: string,
  ): Promise<{ password: string }> {
    return { password: await this.usersService.regeneratePassword(id) };
  }
  
  
  
  @Right('USERS_READ')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
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
  @ApiBearerAuth('jwt')
  @Put('password')
  async updateUserPassword(
    @Query() query: UpdatePasswordDTO,
    @Request() req,
  ): Promise<boolean> {
    return this.usersService.updateUserPassword(query, req.user.email);
  }

  @Right('USERS_UPDATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() changes: updateUserDTO
  ): Promise<void> {
    return this.usersService.updateOne(id, changes);
  }

  @Right('USERS_DELETE')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Delete(':id')
  async deleteUser(@Request() req, @Param('id') id: string): Promise<void> {
    this.usersService.deleteOne(req.user.email, id);
    // TODO: return value
  }

  @Right('USERS_UPDATE')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Post('usersroles')
  async migrateUserRoles(): Promise<void> {
    await this.usersService.migrateUserRoles();
  }

  @Right('USERS_UPDATE')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Post('addusersroles/:id')
  @ApiOperation({ summary: 'Add roles to a specific user' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: 'Roles successfully added.' })
  async addRolesToUser(@Param('id') id: string, @Body() addRolesDto: AddRolesDto): Promise<void> {
    await this.usersService.addRolesToUser(id, addRolesDto.roles);
  }

  @Right('USERS_UPDATE')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @Post('MigrateUUIDUsers/:id')
  @ApiOperation({ summary: 'Add UUID to the existing Users' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: 'UUID successfully added ' })
  async addUUIDToUsers(): Promise<void> {
    await this.usersService.assignUUIDs();
  }

}
