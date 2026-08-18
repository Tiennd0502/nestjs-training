import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '@/modules/user/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userService: { findByEmail: jest.Mock; create: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(() => {
    userService = { findByEmail: jest.fn(), create: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('signed-token') };

    service = new AuthService(userService as any, jwtService as any);
  });

  describe('register', () => {
    it('creates a user and returns an access token when the email is new', async () => {
      userService.findByEmail.mockResolvedValue(null);
      const createdUser = {
        id: 1,
        email: 'jane@example.com',
        passwordHash: 'hashed',
      } as User;
      userService.create.mockResolvedValue(createdUser);

      const result = await service.register({
        email: 'jane@example.com',
        password: 'correct-horse-battery-staple',
      });

      expect(userService.findByEmail).toHaveBeenCalledWith('jane@example.com');
      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'jane@example.com' }),
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'jane@example.com',
      });
      expect(result).toEqual({ accessToken: 'signed-token' });
    });

    it('throws ConflictException when the email is already registered', async () => {
      userService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'jane@example.com',
      });

      await expect(
        service.register({
          email: 'jane@example.com',
          password: 'correct-horse-battery-staple',
        }),
      ).rejects.toThrow(ConflictException);
      expect(userService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns an access token when the credentials are valid', async () => {
      const passwordHash = await bcrypt.hash(
        'correct-horse-battery-staple',
        10,
      );
      userService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'jane@example.com',
        passwordHash,
      });

      const result = await service.login({
        email: 'jane@example.com',
        password: 'correct-horse-battery-staple',
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'jane@example.com',
      });
      expect(result).toEqual({ accessToken: 'signed-token' });
    });

    it('throws UnauthorizedException when no user matches the email', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: 'whatever1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      const passwordHash = await bcrypt.hash(
        'correct-horse-battery-staple',
        10,
      );
      userService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'jane@example.com',
        passwordHash,
      });

      await expect(
        service.login({
          email: 'jane@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
