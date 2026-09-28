import { Inject, Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import {
  USER_REPOSITORY,
  type FindOptions,
  type UserRepository,
} from '../repositories/user-repository.interface.js';
import {
  ERROR_MESSAGES,
  ERROR_DESCRIPTIONS,
} from '../../../common/constants/message.constant.js';
import { ERROR_CODES } from '../../../common/constants/error-code.constant.js';
import {
  PaginatedResult,
  QueryParams,
} from '../../../common/interfaces/pagination.interface.js';
import {
  DuplicateResourceException,
  ItemNotFoundException,
  InvalidRequestException,
} from '../../../common/exceptions/base.exception.js';
import { UserStatus } from '../../../common/enums/user.enum.js';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existingByEmail = await this.userRepository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new DuplicateResourceException({
        errCode: ERROR_CODES.USER.EMAIL_EXISTS,
        field: 'email',
        message: ERROR_MESSAGES.USER.EMAIL_EXISTS,
        description: ERROR_DESCRIPTIONS.USER.EMAIL_EXISTS,
      });
    }

    const existingByClerkId = await this.userRepository.findByClerkId(
      dto.clerkId,
    );
    if (existingByClerkId) {
      throw new DuplicateResourceException({
        errCode: ERROR_CODES.USER.CLERK_ID_EXISTS,
        field: 'clerkId',
        message: ERROR_MESSAGES.USER.CLERK_ID_EXISTS,
        description: ERROR_DESCRIPTIONS.USER.CLERK_ID_EXISTS,
      });
    }

    return this.userRepository.create(dto);
  }

  async findAll(
    query: QueryParams,
    options?: FindOptions,
  ): Promise<PaginatedResult<User>> {
    const result = await this.userRepository.findAll(query, options);
    const { totalCount, pageCount } = result.meta;

    if (totalCount > 0 && query.page > pageCount) {
      throw new InvalidRequestException({
        errCode: ERROR_CODES.USER.PAGE_OUT_OF_RANGE,
        field: 'page',
        message: ERROR_MESSAGES.USER.PAGE_OUT_OF_RANGE,
        description: `The requested page exceeds the available range of ${pageCount} page(s).`,
      });
    }

    return result;
  }

  async findOne(id: string, options?: FindOptions): Promise<User> {
    const user = await this.userRepository.findById(id, options);
    if (!user) {
      throw new ItemNotFoundException({
        errCode: ERROR_CODES.USER.NOT_FOUND,
        field: 'id',
        message: ERROR_MESSAGES.USER.NOT_FOUND,
        description: ERROR_DESCRIPTIONS.USER.NOT_FOUND_BY_ID,
      });
    }

    return user;
  }

  async findByClerkId(clerkId: string): Promise<User> {
    const user = await this.userRepository.findByClerkId(clerkId);
    if (!user) {
      throw new ItemNotFoundException({
        errCode: ERROR_CODES.USER.NOT_FOUND,
        field: 'clerkId',
        message: ERROR_MESSAGES.USER.NOT_FOUND,
        description: ERROR_DESCRIPTIONS.USER.NOT_FOUND_BY_CLERK_ID,
      });
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const updates = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );
    Object.assign(user, updates);
    await this.userRepository.save(user);

    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.deletedAt = new Date();
    user.status = UserStatus.INACTIVE;
    await this.userRepository.save(user);
  }
}
