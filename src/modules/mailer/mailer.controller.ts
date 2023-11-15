import {Body, Controller, Post, Logger, HttpException, HttpStatus} from '@nestjs/common';
import {MailerService} from "@nestjs-modules/mailer";
import {ContactFormDto} from "../../shared/dtos/mailer.dto";
import { validate as emailValidate } from 'email-validator';



@Controller('mailer')
export class MailerController {
  private readonly logger = new Logger(MailerController.name);
  constructor(private readonly mailerService: MailerService) {}

  @Post()
  async sendEmail(@Body() contactFormDto: ContactFormDto) {
    if (!contactFormDto || !contactFormDto.email || !emailValidate(contactFormDto.email)) {
      throw new HttpException('Invalid request data', HttpStatus.BAD_REQUEST);
    }
    this.logger.log(`Received contact form submission from ${contactFormDto.email}`);
    try {
    await this.mailerService.sendMail({
      to: process.env.MAILER_RECIVER, // list of receivers
      subject: `Neues Kontaktformular von ${contactFormDto.name} ${contactFormDto.surname}`, // Subject line
      text: `Nachrichten: ${contactFormDto.message}\nVorname: ${contactFormDto.name}\nNachname: ${contactFormDto.surname}\nPlz: ${contactFormDto.plz}\n
             Email: ${contactFormDto.email}\nHandy Nummer: ${contactFormDto.phone}\n`,
    });
    return { message: 'Email sent successfully!' };
    } catch (error) {
      this.logger.error(`Failed to send email from ${contactFormDto.email}`, error.stack);
      throw new HttpException('Failed to send email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
