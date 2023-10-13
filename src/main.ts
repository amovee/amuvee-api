import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs'

const httpsOptions = {
  key: fs.readFileSync('./secrets/amuvee.de_private_key.key'),
  cert: fs.readFileSync('./secrets/amuvee.de_ssl_certificate.cer'),
};
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
