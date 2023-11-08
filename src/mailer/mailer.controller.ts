import {Body, Controller, Post} from '@nestjs/common';
import {MailerService} from "@nestjs-modules/mailer";


@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post()
  async sendEmail(@Body() contactFormDto: any) {
    // TODO: Validate the contact form DTO
    console.log("env",process.env.MAILER_RECIVER, process.env.MAILER_USER, process.env.MAILER_PASS, process.env.MAILER_HOST)
    console.log("this is contactForm Dto",contactFormDto)
    await this.mailerService.sendMail({
      to: process.env.MAILER_RECIVER, // list of receivers
      subject: 'New contact form submission', // Subject line
      text: `You have a new contact form submission from ${contactFormDto.name} (${contactFormDto.email}): ${contactFormDto.message}`, // plaintext body
    });

    return { message: 'Email sent successfully!' };
  }
}
