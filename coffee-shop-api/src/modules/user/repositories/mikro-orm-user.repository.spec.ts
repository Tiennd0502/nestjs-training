import { MikroOrmUserRepository } from './mikro-orm-user.repository';
import { User } from '../entities/user.entity';
import { UserRole, UserStatus } from '../../../common/enums/user.enum';

describe('MikroOrmUserRepository', () => {
  let repository: MikroOrmUserRepository;
  let entityRepository: { findAndCount: jest.Mock };
  let em: { persist: jest.Mock };

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
    entityRepository = { findAndCount: jest.fn() };
    em = { persist: jest.fn(() => ({ flush: jest.fn() })) };

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
        { limit: 10, offset: 20 },
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
});
