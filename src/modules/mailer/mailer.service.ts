import { Injectable } from '@nestjs/common';
 import { MailerService as BaseMailerService } from '@nestjs-modules/mailer';


@Injectable()
export class MailerService {
   constructor(private readonly baseMailerService: BaseMailerService) {}
   async sendMail(to: string, subject: string, text: string): Promise<void> {
     await this.baseMailerService.sendMail({
       to,
       subject,
       text,
     });
   }
}
