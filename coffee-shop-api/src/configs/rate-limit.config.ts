import { ConfigService } from '@nestjs/config';
import { ThrottlerModuleOptions } from '@nestjs/throttler';

export function rateLimitConfig(
  configService: ConfigService,
): ThrottlerModuleOptions {
  return {
    throttlers: [
      {
        ttl: configService.getOrThrow<number>('RATE_LIMIT_WINDOW_MS'),
        limit: configService.getOrThrow<number>('RATE_LIMIT_MAX_REQUESTS'),
      },
    ],
    errorMessage: 'Too many requests, please try again later.',
  };
}
