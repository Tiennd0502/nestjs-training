import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import mikroOrmConfig from './configs/mikro-orm.config';
import { validate } from './configs/env.validation';
import { rateLimitConfig } from './configs/rate-limit.config';
import { UserModule } from './modules/user/user.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { createValidationPipe } from './configs/validation-pipe.config';
import { ClerkAuthMiddleware } from './common/middlewares/clerk-auth.middleware';
import { UserResolutionMiddleware } from './common/middlewares/user-resolution.middleware';
import { AuthProviderModule } from './common/providers/auth-provider.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: rateLimitConfig,
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    AuthProviderModule,
    UserModule,
    WebhookModule,
    CategoryModule,
    ProductModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useFactory: createValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(ClerkAuthMiddleware, UserResolutionMiddleware)
      .exclude({ path: 'webhooks/clerk', method: RequestMethod.POST })
      .forRoutes('*');
  }
}
