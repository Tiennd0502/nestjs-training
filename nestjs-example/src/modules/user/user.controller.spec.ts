import { ForbiddenException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: { getById: jest.Mock; update: jest.Mock; delete: jest.Mock };
  const currentUser = { userId: 1, email: 'jane@example.com' };

  const baseUser = {
    id: 1,
    email: 'jane@example.com',
    passwordHash: 'hashed',
    name: 'Jane',
    createdAt: new Date('2026-08-18T00:00:00.000Z'),
    updatedAt: new Date('2026-08-18T00:00:00.000Z'),
  };

  beforeEach(() => {
    userService = { getById: jest.fn(), update: jest.fn(), delete: jest.fn() };
    controller = new UserController(userService as unknown as UserService);
  });

  describe('findMe', () => {
    it("returns the caller's own user without the password hash", async () => {
      userService.getById.mockResolvedValue(baseUser);

      const result = await controller.findMe(currentUser);

      expect(userService.getById).toHaveBeenCalledWith(currentUser.userId);
      expect(result).toEqual({
        id: baseUser.id,
        email: baseUser.email,
        name: baseUser.name,
        createdAt: baseUser.createdAt,
        updatedAt: baseUser.updatedAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('findOne', () => {
    it('returns the current user without the password hash', async () => {
      userService.getById.mockResolvedValue(baseUser);

      const result = await controller.findOne(1, currentUser);

      expect(userService.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: baseUser.id,
        email: baseUser.email,
        name: baseUser.name,
        createdAt: baseUser.createdAt,
        updatedAt: baseUser.updatedAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws ForbiddenException when the id does not match the caller', async () => {
      await expect(controller.findOne(2, currentUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(userService.getById).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it("delegates to UserService.update with the current user's id and returns the result without the password hash", async () => {
      const dto = { email: 'new@example.com' };
      const updated = {
        ...baseUser,
        email: 'new@example.com',
        updatedAt: new Date('2026-08-18T00:05:00.000Z'),
      };
      userService.update.mockResolvedValue(updated);

      const result = await controller.update(1, currentUser, dto);

      expect(userService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws ForbiddenException when the id does not match the caller', async () => {
      await expect(controller.update(2, currentUser, {})).rejects.toThrow(
        ForbiddenException,
      );
      expect(userService.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it("delegates to UserService.delete with the current user's id", async () => {
      await controller.remove(1, currentUser);

      expect(userService.delete).toHaveBeenCalledWith(1);
    });

    it('throws ForbiddenException when the id does not match the caller', async () => {
      await expect(controller.remove(2, currentUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(userService.delete).not.toHaveBeenCalled();
    });
  });
});
