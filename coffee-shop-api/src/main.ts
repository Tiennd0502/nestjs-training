import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { DEFAULT_PORT } from './common/constants';
import { corsConfig } from './configs/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.enableCors(corsConfig(configService));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? DEFAULT_PORT);
}
bootstrap();
