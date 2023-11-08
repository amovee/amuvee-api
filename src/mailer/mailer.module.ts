import { Module } from '@nestjs/common';
import { MailerModule as BaseMailerModule } from '@nestjs-modules/mailer';
import { MailerService } from './mailer.service';

@Module({
  imports: [
    BaseMailerModule.forRoot({
      // SMTP transport configuration
      transport: {
        host: process.env.MAILER_HOST,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS,
        },
      },
      defaults: {
        from: '"No Reply" <noreply@amuvee.de>',
      },
    }),
  ],
  providers: [MailerService],
  exports: [MailerService], // Export the MailerService for use in other modules
})
export class MailerModule {}
