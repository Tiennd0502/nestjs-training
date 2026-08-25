import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { ResponseUserDto } from '../dto/response-user.dto';
import { UserRole, UserStatus } from '../../../common/enums/user.enum';

describe('UserController', () => {
  let controller: UserController;
  let userService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    softDelete: jest.Mock;
  };

  const user = {
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
  } as User;

  beforeEach(async () => {
    userService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();

    controller = module.get(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('delegates to UserService.create and returns its result', async () => {
      const dto = {
        clerkId: 'clerk-1',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
      };
      userService.create.mockResolvedValue(user);

      const result = await controller.create(dto);

      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(ResponseUserDto.fromEntity(user));
    });
  });

  describe('findAll', () => {
    it('delegates to UserService.findAll', async () => {
      userService.findAll.mockResolvedValue([user]);

      const result = await controller.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual([ResponseUserDto.fromEntity(user)]);
    });
  });

  describe('findOne', () => {
    it('delegates to UserService.findOne', async () => {
      userService.findOne.mockResolvedValue(user);

      const result = await controller.findOne('user-id-1');

      expect(userService.findOne).toHaveBeenCalledWith('user-id-1');
      expect(result).toEqual(ResponseUserDto.fromEntity(user));
    });

    it('propagates NotFoundException', async () => {
      userService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('delegates to UserService.update', async () => {
      const dto = { firstName: 'Janet' };
      const updatedUser = { ...user, firstName: 'Janet' };
      userService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-id-1', dto);

      expect(userService.update).toHaveBeenCalledWith('user-id-1', dto);
      expect(result).toEqual(ResponseUserDto.fromEntity(updatedUser));
    });

    it('propagates NotFoundException', async () => {
      userService.update.mockRejectedValue(new NotFoundException());

      await expect(
        controller.update('missing-id', { firstName: 'Janet' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('delegates to UserService.softDelete', async () => {
      userService.softDelete.mockResolvedValue(undefined);

      await controller.remove('user-id-1');

      expect(userService.softDelete).toHaveBeenCalledWith('user-id-1');
    });

    it('propagates NotFoundException', async () => {
      userService.softDelete.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
