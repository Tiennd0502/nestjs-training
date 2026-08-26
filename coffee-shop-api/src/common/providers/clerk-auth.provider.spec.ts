import { BadRequestException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { createClerkClient, getAuth } from '@clerk/express';
import { Webhook } from 'svix';
import { ClerkAuthProvider } from './clerk-auth.provider';
import { UserRole } from '../enums/user.enum';

const verify = jest.fn();
const updateUserMetadata = jest.fn();

jest.mock('svix', () => ({
  Webhook: jest.fn().mockImplementation(() => ({ verify })),
}));

jest.mock('@clerk/express', () => ({
  getAuth: jest.fn(),
  createClerkClient: jest.fn().mockImplementation(() => ({
    users: { updateUserMetadata },
  })),
}));

describe('ClerkAuthProvider', () => {
  let provider: ClerkAuthProvider;
  let configService: { getOrThrow: jest.Mock };

  beforeEach(() => {
    configService = { getOrThrow: jest.fn().mockReturnValue('secret') };
    provider = new ClerkAuthProvider(configService as never as ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('builds the Clerk client and webhook verifier from ConfigService', () => {
    expect(configService.getOrThrow).toHaveBeenCalledWith('CLERK_SECRET_KEY');
    expect(configService.getOrThrow).toHaveBeenCalledWith(
      'CLERK_WEBHOOK_SECRET',
    );
    expect(createClerkClient).toHaveBeenCalledWith({ secretKey: 'secret' });
    expect(Webhook).toHaveBeenCalledWith('secret');
  });

  const headers = {
    'svix-id': 'msg-1',
    'svix-timestamp': '1700000000',
    'svix-signature': 'v1,abc',
  };

  describe('verifyWebhook', () => {
    it('returns the parsed event when the signature verifies', () => {
      const event = { type: 'user.created', data: { id: 'clerk-1' } };
      verify.mockReturnValue(event);

      const result = provider.verifyWebhook(Buffer.from('{}'), headers);

      expect(verify).toHaveBeenCalledWith(Buffer.from('{}'), headers);
      expect(result).toBe(event);
    });

    it('throws BadRequestException when signature verification fails', () => {
      verify.mockImplementation(() => {
        throw new Error('bad signature');
      });

      expect(() => provider.verifyWebhook(Buffer.from('{}'), headers)).toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException without calling the verifier when the raw body is missing', () => {
      expect(() => provider.verifyWebhook(undefined, headers)).toThrow(
        BadRequestException,
      );
      expect(verify).not.toHaveBeenCalled();
    });
  });

  describe('syncUserRole', () => {
    it('pushes the role into the provider publicMetadata', async () => {
      updateUserMetadata.mockResolvedValue(undefined);

      await provider.syncUserRole('clerk-1', UserRole.ADMIN);

      expect(updateUserMetadata).toHaveBeenCalledWith('clerk-1', {
        publicMetadata: { role: UserRole.ADMIN },
      });
    });

    it('propagates an error from the underlying client unchanged', async () => {
      updateUserMetadata.mockRejectedValue(new Error('clerk api down'));

      await expect(
        provider.syncUserRole('clerk-1', UserRole.USER),
      ).rejects.toThrow('clerk api down');
    });
  });

  describe('getSessionUserId', () => {
    it('returns the userId from the Clerk session', () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: 'clerk-1' });

      expect(provider.getSessionUserId({} as never)).toBe('clerk-1');
    });

    it('returns null when there is no Clerk session', () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      expect(provider.getSessionUserId({} as never)).toBeNull();
    });
  });
});
