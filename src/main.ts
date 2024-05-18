import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

const httpsOptions = {
  key: fs.readFileSync('./secrets/amuvee.de_private_key.key'),
  cert: fs.readFileSync('./secrets/amuvee.de_ssl_certificate.cer'),
};
const nestApplicationOprions = { httpsOptions }
async function bootstrap() {
  const app = await NestFactory.create(AppModule
    ,process.env.HTTPS=='true'?nestApplicationOprions:{}
  );
  const config = new DocumentBuilder()
    .setTitle('Amuvee API')
    .setDescription('The Amuvee API description')
    .setVersion('1.0')
    .addTag('_Auths')
    .addTag('Actions')
    .addTag('Categories')
    .addTag('Events')
    .addTag('Insurances')
    .addTag('Locations')
    .addTag('Migrations')
    .addTag('Regions')
    .addTag('ResultType')
    .addTag('Results')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(3000);
}
bootstrap();
