import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { RequestMethod, VersioningType } from '@nestjs/common';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import {
  DEFAULT_PORT,
  DEFAULT_API_VERSION,
  API_PREFIX,
} from './common/constants/env.constant.js';
import { corsConfig } from './configs/cors.config.js';
import { setupSwagger } from './configs/swagger.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.enableCors(corsConfig(configService));
  app.setGlobalPrefix(API_PREFIX, {
    exclude: [{ path: 'webhooks/clerk', method: RequestMethod.POST }],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: DEFAULT_API_VERSION,
  });
  setupSwagger(app);

  await app.listen(process.env.PORT ?? DEFAULT_PORT);
}
await bootstrap();
