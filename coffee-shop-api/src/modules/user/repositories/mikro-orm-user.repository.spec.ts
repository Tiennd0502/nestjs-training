import { MikroOrmUserRepository } from './mikro-orm-user.repository.js';
import { User } from '../entities/user.entity.js';
import { UserRole, UserStatus } from '../../../common/enums/user.enum.js';

import type { Mock } from 'vitest';
describe('MikroOrmUserRepository', () => {
  let repository: MikroOrmUserRepository;
  let entityRepository: { findAndCount: Mock; findOne: Mock };
  let em: { persist: Mock };

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-id-1',
    clerkId: 'clerk-1',
    email: 'jane@example.com',
    role: UserRole.USER,
    firstName: 'Jane',
    lastName: 'Doe',
    phoneNumber: null,
    avatarUrl: null,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  });

  beforeEach(() => {
    entityRepository = { findAndCount: vi.fn(), findOne: vi.fn() };
    em = { persist: vi.fn(() => ({ flush: vi.fn() })) };

    repository = new MikroOrmUserRepository(
      entityRepository as never,
      em as never,
    );
  });

  describe('findAll', () => {
    it('requests the correct offset and limit for the given page', async () => {
      entityRepository.findAndCount.mockResolvedValue([[], 0]);

      await repository.findAll({ page: 3, limit: 10 });

      expect(entityRepository.findAndCount).toHaveBeenCalledWith(
        {},
        {
          limit: 10,
          offset: 20,
          orderBy: { createdAt: 'DESC' },
          filters: { softDelete: true },
        },
      );
    });

    it('disables the softDelete filter when includeDeleted is true', async () => {
      entityRepository.findAndCount.mockResolvedValue([[], 0]);

      await repository.findAll(
        { page: 1, limit: 10 },
        { includeDeleted: true },
      );

      expect(entityRepository.findAndCount).toHaveBeenCalledWith(
        {},
        {
          limit: 10,
          offset: 0,
          orderBy: { createdAt: 'DESC' },
          filters: { softDelete: false },
        },
      );
    });

    it('excludes the given user id when excludeUserId is set', async () => {
      entityRepository.findAndCount.mockResolvedValue([[], 0]);

      await repository.findAll(
        { page: 1, limit: 10 },
        { excludeUserId: 'user-id-1' },
      );

      expect(entityRepository.findAndCount).toHaveBeenCalledWith(
        { id: { $ne: 'user-id-1' } },
        {
          limit: 10,
          offset: 0,
          orderBy: { createdAt: 'DESC' },
          filters: { softDelete: true },
        },
      );
    });

    it('returns the resolved rows as data, unmodified', async () => {
      const users = [buildUser()];
      entityRepository.findAndCount.mockResolvedValue([users, 1]);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.data).toBe(users);
    });

    it('computes meta, rounding pageCount up when totalCount does not divide evenly by limit', async () => {
      entityRepository.findAndCount.mockResolvedValue([[], 25]);

      const result = await repository.findAll({ page: 2, limit: 10 });

      expect(result.meta).toEqual({
        limit: 10,
        currentPage: 2,
        pageCount: 3,
        totalCount: 25,
      });
    });
  });

  describe('findById', () => {
    it('applies the softDelete filter by default', async () => {
      entityRepository.findOne.mockResolvedValue(null);

      await repository.findById('user-id-1');

      expect(entityRepository.findOne).toHaveBeenCalledWith(
        { id: 'user-id-1' },
        { filters: { softDelete: true } },
      );
    });

    it('disables the softDelete filter when includeDeleted is true', async () => {
      entityRepository.findOne.mockResolvedValue(null);

      await repository.findById('user-id-1', { includeDeleted: true });

      expect(entityRepository.findOne).toHaveBeenCalledWith(
        { id: 'user-id-1' },
        { filters: { softDelete: false } },
      );
    });
  });
});
