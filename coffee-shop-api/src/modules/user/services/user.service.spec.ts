import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { UserRole, UserStatus } from '../../../common/enums/user.enum';
import { USER_REPOSITORY } from '../repositories/user-repository.interface';

describe('UserService', () => {
  let service: UserService;
  let userRepository: {
    findById: jest.Mock;
    findByEmail: jest.Mock;
    findByClerkId: jest.Mock;
    findAll: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

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

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByClerkId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: USER_REPOSITORY, useValue: userRepository },
      ],
    }).compile();

    service = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = {
      clerkId: 'clerk-1',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    it('creates and returns a user', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByClerkId.mockResolvedValue(null);
      const created = buildUser();
      userRepository.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(created);
    });

    it('throws ConflictException on duplicate email', async () => {
      userRepository.findByEmail.mockResolvedValue(buildUser());

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException on duplicate clerkId', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByClerkId.mockResolvedValue(buildUser());

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('passes a client-provided role through to the repository', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByClerkId.mockResolvedValue(null);
      const dtoWithRole = { ...dto, role: UserRole.ADMIN };
      userRepository.create.mockResolvedValue(
        buildUser({ role: UserRole.ADMIN }),
      );

      await service.create(dtoWithRole);

      expect(userRepository.create).toHaveBeenCalledWith(dtoWithRole);
    });
  });

  describe('findAll', () => {
    it('forwards the pagination query to the repository and returns its result, unmodified', async () => {
      // Soft-delete exclusion is enforced by BaseEntity's default MikroORM
      // @Filter at the DB layer, not by this service — that mechanism can
      // only be genuinely verified against a real DB (see the e2e suite).
      // This test only guards against the service re-filtering or wrapping
      // the repository's result.
      const paginatedUsers = {
        data: [buildUser()],
        meta: { limit: 10, currentPage: 1, pageCount: 1, totalCount: 1 },
      };
      userRepository.findAll.mockResolvedValue(paginatedUsers);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(userRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result).toBe(paginatedUsers);
    });

    it('throws BadRequestException when the requested page exceeds pageCount', async () => {
      userRepository.findAll.mockResolvedValue({
        data: [],
        meta: { limit: 10, currentPage: 5, pageCount: 4, totalCount: 35 },
      });

      await expect(
        service.findAll({ page: 5, limit: 10 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('does not throw for an in-range page equal to pageCount', async () => {
      const paginatedUsers = {
        data: [buildUser()],
        meta: { limit: 10, currentPage: 4, pageCount: 4, totalCount: 35 },
      };
      userRepository.findAll.mockResolvedValue(paginatedUsers);

      const result = await service.findAll({ page: 4, limit: 10 });

      expect(result).toBe(paginatedUsers);
    });

    it('does not throw for page 1 when there is no data at all', async () => {
      const paginatedUsers = {
        data: [],
        meta: { limit: 10, currentPage: 1, pageCount: 0, totalCount: 0 },
      };
      userRepository.findAll.mockResolvedValue(paginatedUsers);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toBe(paginatedUsers);
    });
  });

  describe('findOne', () => {
    it('returns an existing user', async () => {
      const user = buildUser();
      userRepository.findById.mockResolvedValue(user);

      const result = await service.findOne('user-id-1');

      expect(userRepository.findById).toHaveBeenCalledWith('user-id-1');
      expect(result).toBe(user);
    });

    it('throws NotFoundException when the repository has no match (covers both a missing id and a soft-deleted one, since soft-delete filtering happens at the MikroORM/DB layer, not here)', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findByClerkId', () => {
    it('returns the matching user', async () => {
      const user = buildUser();
      userRepository.findByClerkId.mockResolvedValue(user);

      const result = await service.findByClerkId('clerk-1');

      expect(userRepository.findByClerkId).toHaveBeenCalledWith('clerk-1');
      expect(result).toBe(user);
    });

    it('throws NotFoundException for a non-matching clerkId', async () => {
      userRepository.findByClerkId.mockResolvedValue(null);

      await expect(
        service.findByClerkId('missing-clerk-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns the user', async () => {
      const user = buildUser();
      userRepository.findById.mockResolvedValue(user);
      const dto = { firstName: 'Janet' };

      const result = await service.update('user-id-1', dto);

      expect(user.firstName).toBe('Janet');
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(result).toBe(user);
    });

    it('throws NotFoundException for a missing id', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { firstName: 'Janet' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('sets deletedAt without removing the row', async () => {
      const user = buildUser();
      userRepository.findById.mockResolvedValue(user);

      await service.softDelete('user-id-1');

      expect(user.deletedAt).toBeInstanceOf(Date);
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it('throws NotFoundException for a missing or already-deleted id', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.softDelete('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
