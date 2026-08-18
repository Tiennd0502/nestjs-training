import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: { findOne: jest.Mock; create: jest.Mock };
  let em: {
    persistAndFlush: jest.Mock;
    flush: jest.Mock;
    removeAndFlush: jest.Mock;
  };

  beforeEach(() => {
    userRepository = { findOne: jest.fn(), create: jest.fn() };
    em = {
      persistAndFlush: jest.fn(),
      flush: jest.fn(),
      removeAndFlush: jest.fn(),
    };

    service = new UserService(userRepository as any, em as any);
  });

  describe('create', () => {
    it('persists a new user and returns it', async () => {
      const created = {
        id: 1,
        email: 'jane@example.com',
        passwordHash: 'hashed',
      } as User;
      userRepository.create.mockReturnValue(created);

      const result = await service.create({
        email: 'jane@example.com',
        passwordHash: 'hashed',
      });

      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'jane@example.com',
        passwordHash: 'hashed',
      });
      expect(em.persistAndFlush).toHaveBeenCalledWith(created);
      expect(result).toBe(created);
    });
  });

  describe('findById', () => {
    it('returns the user when found', async () => {
      const user = { id: 1 } as User;
      userRepository.findOne.mockResolvedValue(user);

      await expect(service.findById(1)).resolves.toBe(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({ id: 1 });
    });

    it('returns null when no user matches the id', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(1)).resolves.toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('returns the user when found', async () => {
      const user = { id: 1, email: 'jane@example.com' } as User;
      userRepository.findOne.mockResolvedValue(user);

      await expect(service.findByEmail('jane@example.com')).resolves.toBe(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: 'jane@example.com',
      });
    });

    it('returns null when no user matches the email', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findByEmail('unknown@example.com'),
      ).resolves.toBeNull();
    });
  });

  describe('getById', () => {
    it('throws NotFoundException when no user matches the id', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.getById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('applies the change and persists it', async () => {
      const user = { id: 1, email: 'jane@example.com' } as User;
      userRepository.findOne
        .mockResolvedValueOnce(user) // getById
        .mockResolvedValueOnce(null); // findByEmail conflict check

      const result = await service.update(1, { email: 'new@example.com' });

      expect(user.email).toBe('new@example.com');
      expect(em.flush).toHaveBeenCalled();
      expect(result).toBe(user);
    });

    it('throws NotFoundException when the id does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, { email: 'new@example.com' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('applies a name change', async () => {
      const user = { id: 1, email: 'jane@example.com' } as User;
      userRepository.findOne.mockResolvedValueOnce(user); // getById only, no email change

      const result = await service.update(1, { name: 'Jane' });

      expect(user.name).toBe('Jane');
      expect(em.flush).toHaveBeenCalled();
      expect(result).toBe(user);
    });

    it('throws ConflictException when the new email is already taken by a different user', async () => {
      const user = { id: 1, email: 'jane@example.com' } as User;
      const otherUser = { id: 2, email: 'taken@example.com' } as User;
      userRepository.findOne
        .mockResolvedValueOnce(user) // getById
        .mockResolvedValueOnce(otherUser); // findByEmail conflict check

      await expect(
        service.update(1, { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it("succeeds when the new email matches the user's current email", async () => {
      const user = { id: 1, email: 'jane@example.com' } as User;
      userRepository.findOne.mockResolvedValueOnce(user); // getById only

      const result = await service.update(1, { email: 'jane@example.com' });

      expect(em.flush).toHaveBeenCalled();
      expect(result).toBe(user);
    });
  });

  describe('delete', () => {
    it('removes the user', async () => {
      const user = { id: 1 } as User;
      userRepository.findOne.mockResolvedValue(user);

      await service.delete(1);

      expect(em.removeAndFlush).toHaveBeenCalledWith(user);
    });

    it('throws NotFoundException when the id does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });
});
