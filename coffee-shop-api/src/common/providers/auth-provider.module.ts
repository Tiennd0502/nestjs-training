import { Global, Module } from '@nestjs/common';
import { AUTH_PROVIDER } from './auth-provider.interface.js';
import { ClerkAuthProvider } from './clerk-auth.provider.js';

@Global()
@Module({
  providers: [{ provide: AUTH_PROVIDER, useClass: ClerkAuthProvider }],
  exports: [AUTH_PROVIDER],
})
export class AuthProviderModule {}
