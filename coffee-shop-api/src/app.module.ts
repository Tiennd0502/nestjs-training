import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import mikroOrmConfig from './configs/mikro-orm.config';
import { validate } from './configs/env.validation';
import { rateLimitConfig } from './configs/rate-limit.config';
import { UserModule } from './modules/user/user.module';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: rateLimitConfig,
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
  ],
})
export class AppModule {}
