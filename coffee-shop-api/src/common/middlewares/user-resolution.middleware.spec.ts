import { NotFoundException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { UserResolutionMiddleware } from './user-resolution.middleware';
import { UserRole, UserStatus } from '../enums/user.enum';
import type { User } from '../../modules/user/entities/user.entity';

describe('UserResolutionMiddleware', () => {
  let middleware: UserResolutionMiddleware;
  let authProvider: { getSessionUserId: jest.Mock };
  let userService: { findByClerkId: jest.Mock };
  let req: { user?: User };
  let next: jest.Mock;

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-id-1',
    clerkId: 'clerk-1',
    email: 'jane@example.com',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    firstName: 'Jane',
    lastName: 'Doe',
    phoneNumber: null,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  });

  beforeEach(() => {
    req = {};
    authProvider = { getSessionUserId: jest.fn() };
    userService = { findByClerkId: jest.fn() };
    middleware = new UserResolutionMiddleware(
      authProvider as never,
      userService as never,
    );
    next = jest.fn();
  });

  describe('use', () => {
    it('calls next() without looking up a user when the provider resolves no session', async () => {
      authProvider.getSessionUserId.mockReturnValue(null);

      await middleware.use(req as Request, {} as Response, next);

      expect(userService.findByClerkId).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });

    it('attaches the matching user (any status) and calls next()', async () => {
      const user = buildUser({ status: UserStatus.INACTIVE });
      authProvider.getSessionUserId.mockReturnValue('clerk-1');
      userService.findByClerkId.mockResolvedValue(user);

      await middleware.use(req as Request, {} as Response, next);

      expect(req.user).toBe(user);
      expect(next).toHaveBeenCalledWith();
    });

    it('leaves req.user undefined and calls next() when the session matches no local user', async () => {
      authProvider.getSessionUserId.mockReturnValue('clerk-1');
      userService.findByClerkId.mockRejectedValue(new NotFoundException());

      await middleware.use(req as Request, {} as Response, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });

    it('forwards a genuinely unexpected lookup error to next(), unlike NotFoundException', async () => {
      const error = new Error('boom');
      authProvider.getSessionUserId.mockReturnValue('clerk-1');
      userService.findByClerkId.mockRejectedValue(error);

      await middleware.use(req as Request, {} as Response, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
