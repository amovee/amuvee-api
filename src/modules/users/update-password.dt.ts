import { IsNotEmpty } from '@nestjs/class-validator';
export class UpdatePasswordDTO {
    @IsNotEmpty()
    oldPassword: string;
    newPassword: string;
}