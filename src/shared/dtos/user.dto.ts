import { right } from 'src/shared/dtos/rights';

export class UpdatePasswordDTO {
  oldPassword: string;
  newPassword: string;
}
export interface createUserDTO {
  name: string;
  email: string;
  rights: right[];
  isAdmin: boolean;
}
export interface updateUserDTO {
  name?: string;
  email?: string;
  rights?: right[];
  isAdmin?: boolean;
}
