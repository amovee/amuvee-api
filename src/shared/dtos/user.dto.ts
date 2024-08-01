import { right } from 'src/shared/dtos/rights';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDTO {
  oldPassword: string;
  newPassword: string;
}
export interface createUserDTO {
  name: string;
  email: string;
  rights: right[];
  isAdmin: boolean;
  password?: string;
  roles: string[];
}
export interface updateUserDTO {
  name?: string;
  email?: string;
  rights?: right[];
  isAdmin?: boolean;
}

export class AddRolesDto {
  @ApiProperty({
    description: 'List of roles to add to the user',
    example: ['Admin', 'User'],
    type: [String]
  })
  roles: string[];
}