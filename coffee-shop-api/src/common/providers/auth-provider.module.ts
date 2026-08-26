import { Global, Module } from '@nestjs/common';
import { AUTH_PROVIDER } from './auth-provider.interface';
import { ClerkAuthProvider } from './clerk-auth.provider';

@Global()
@Module({
  providers: [{ provide: AUTH_PROVIDER, useClass: ClerkAuthProvider }],
  exports: [AUTH_PROVIDER],
})
export class AuthProviderModule {}
