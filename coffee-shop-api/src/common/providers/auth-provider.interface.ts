import type { IncomingHttpHeaders } from 'http';
import type { Request } from 'express';
import { UserRole } from '../enums/user.enum';

export const AUTH_PROVIDER = Symbol('AUTH_PROVIDER');

export interface AuthWebhookEvent {
  type: string;
  data: unknown;
}

export interface AuthProvider {
  verifyWebhook(
    rawBody: Buffer | undefined,
    headers: IncomingHttpHeaders,
  ): AuthWebhookEvent;
  syncUserRole(providerId: string, role: UserRole): Promise<void>;
  getSessionUserId(req: Request): string | null;
}
