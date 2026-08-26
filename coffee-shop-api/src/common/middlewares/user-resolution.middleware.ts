import {
  Inject,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { UserService } from '../../modules/user/services/user.service';
import {
  AUTH_PROVIDER,
  type AuthProvider,
} from '../providers/auth-provider.interface';

@Injectable()
export class UserResolutionMiddleware implements NestMiddleware {
  constructor(
    @Inject(AUTH_PROVIDER) private readonly authProvider: AuthProvider,
    private readonly userService: UserService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const userId = this.authProvider.getSessionUserId(req);

    if (userId) {
      try {
        req.user = await this.userService.findByClerkId(userId);
      } catch (err) {
        if (!(err instanceof NotFoundException)) {
          next(err as Error);
          return;
        }
      }
    }

    next();
  }
}
