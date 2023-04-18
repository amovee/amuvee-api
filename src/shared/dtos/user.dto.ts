import { right } from 'src/types/rights';

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
