import { NestFactory } from '@nestjs/core';
import { DEFAULT_PORT } from '@/shared/constants';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? DEFAULT_PORT);
}
bootstrap();
