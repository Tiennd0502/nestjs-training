import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { ClerkWebhookService } from './clerk-webhook.service';
import { UserRole } from '../../../common/enums/user.enum';
import type { User } from '../../user/entities/user.entity';

describe('ClerkWebhookService', () => {
  let service: ClerkWebhookService;
  let authProvider: { verifyWebhook: jest.Mock; syncUserRole: jest.Mock };
  let userService: {
    create: jest.Mock;
    findByClerkId: jest.Mock;
    update: jest.Mock;
    softDelete: jest.Mock;
  };

  const buildUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-id-1',
      clerkId: 'clerk-1',
      email: 'jane@example.com',
      role: UserRole.USER,
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: null,
      avatarUrl: null,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    }) as User;

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    authProvider = { verifyWebhook: jest.fn(), syncUserRole: jest.fn() };
    userService = {
      create: jest.fn(),
      findByClerkId: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    service = new ClerkWebhookService(authProvider, userService as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const headers = {
    'svix-id': 'msg-1',
    'svix-timestamp': '1700000000',
    'svix-signature': 'v1,abc',
  };

  describe('verifyAndParse', () => {
    it('delegates to AuthProvider.verifyWebhook and returns its result', () => {
      const event = { type: 'user.created', data: { id: 'clerk-1' } };
      authProvider.verifyWebhook.mockReturnValue(event);

      const result = service.verifyAndParse(Buffer.from('{}'), headers);

      expect(authProvider.verifyWebhook).toHaveBeenCalledWith(
        Buffer.from('{}'),
        headers,
      );
      expect(result).toBe(event);
    });
  });

  describe('handleEvent', () => {
    const emailAddresses = [
      { id: 'email-1', email_address: 'jane@example.com' },
    ];

    describe('user.created', () => {
      const createdEventData = {
        id: 'clerk-1',
        email_addresses: emailAddresses,
        primary_email_address_id: 'email-1',
        first_name: 'Jane',
        last_name: 'Doe',
        phone_numbers: [],
        primary_phone_number_id: null,
        image_url: 'https://example.com/avatar.png',
        public_metadata: {},
      };
      const createdEvent = {
        type: 'user.created',
        data: createdEventData,
      } as never;

      it('creates the user and best-effort pushes the role back to Clerk', async () => {
        const created = buildUser();
        userService.create.mockResolvedValue(created);
        authProvider.syncUserRole.mockResolvedValue(undefined);

        await service.handleEvent(createdEvent);

        expect(userService.create).toHaveBeenCalledWith({
          clerkId: 'clerk-1',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          phoneNumber: undefined,
          avatarUrl: 'https://example.com/avatar.png',
          role: undefined,
        });
        expect(authProvider.syncUserRole).toHaveBeenCalledWith(
          'clerk-1',
          created.role,
        );
      });

      it('does not call UserService.create when there is no primary email', async () => {
        const eventWithoutPrimaryEmail = {
          type: 'user.created',
          data: {
            ...createdEventData,
            primary_email_address_id: 'missing-id',
          },
        } as never;

        await service.handleEvent(eventWithoutPrimaryEmail);

        expect(userService.create).not.toHaveBeenCalled();
      });

      it('swallows a ConflictException from a redelivered webhook', async () => {
        userService.create.mockRejectedValue(new ConflictException());

        await expect(
          service.handleEvent(createdEvent),
        ).resolves.toBeUndefined();
        expect(authProvider.syncUserRole).not.toHaveBeenCalled();
      });

      it('lets a non-ConflictException error from create propagate', async () => {
        userService.create.mockRejectedValue(new Error('boom'));

        await expect(service.handleEvent(createdEvent)).rejects.toThrow('boom');
      });

      it('does not throw when the best-effort Clerk role push fails', async () => {
        const created = buildUser();
        userService.create.mockResolvedValue(created);
        authProvider.syncUserRole.mockRejectedValue(
          new Error('clerk api down'),
        );

        await expect(
          service.handleEvent(createdEvent),
        ).resolves.toBeUndefined();
      });
    });

    describe('user.updated', () => {
      const updatedEvent = {
        type: 'user.updated',
        data: {
          id: 'clerk-1',
          email_addresses: emailAddresses,
          primary_email_address_id: 'email-1',
          first_name: 'Janet',
          last_name: 'Doe',
          phone_numbers: [],
          primary_phone_number_id: null,
          image_url: 'https://example.com/avatar2.png',
          public_metadata: { role: 'ADMIN' },
        },
      } as never;

      it('updates the matching local user with the mapped fields, no email', async () => {
        const existing = buildUser();
        userService.findByClerkId.mockResolvedValue(existing);

        await service.handleEvent(updatedEvent);

        expect(userService.update).toHaveBeenCalledWith(existing.id, {
          firstName: 'Janet',
          lastName: 'Doe',
          phoneNumber: undefined,
          avatarUrl: 'https://example.com/avatar2.png',
          role: 'ADMIN',
        });
      });

      it('does not throw and does not update when there is no local match', async () => {
        userService.findByClerkId.mockRejectedValue(new NotFoundException());

        await expect(
          service.handleEvent(updatedEvent),
        ).resolves.toBeUndefined();
        expect(userService.update).not.toHaveBeenCalled();
      });
    });

    describe('user.deleted', () => {
      const deletedEvent = {
        type: 'user.deleted',
        data: { id: 'clerk-1' },
      } as never;

      it('soft-deletes the matching local user', async () => {
        const existing = buildUser();
        userService.findByClerkId.mockResolvedValue(existing);

        await service.handleEvent(deletedEvent);

        expect(userService.softDelete).toHaveBeenCalledWith(existing.id);
      });

      it('does not throw and does not delete when there is no local match', async () => {
        userService.findByClerkId.mockRejectedValue(new NotFoundException());

        await expect(
          service.handleEvent(deletedEvent),
        ).resolves.toBeUndefined();
        expect(userService.softDelete).not.toHaveBeenCalled();
      });

      it('does not throw and does not look up when the event has no clerk id', async () => {
        const eventWithoutId = {
          type: 'user.deleted',
          data: { id: undefined },
        } as never;

        await expect(
          service.handleEvent(eventWithoutId),
        ).resolves.toBeUndefined();
        expect(userService.findByClerkId).not.toHaveBeenCalled();
      });
    });

    describe('unhandled event type', () => {
      it('does not throw and calls none of the UserService methods', async () => {
        const otherEvent = { type: 'session.created', data: {} } as never;

        await expect(service.handleEvent(otherEvent)).resolves.toBeUndefined();
        expect(userService.create).not.toHaveBeenCalled();
        expect(userService.findByClerkId).not.toHaveBeenCalled();
        expect(userService.update).not.toHaveBeenCalled();
        expect(userService.softDelete).not.toHaveBeenCalled();
      });
    });
  });
});
