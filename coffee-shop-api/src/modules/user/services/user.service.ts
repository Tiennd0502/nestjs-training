import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../repositories/user-repository.interface';
import { ERROR_MESSAGES } from '../../../common/constants/message.constant';
import {
  PaginatedResult,
  QueryParams,
} from '../../../common/interfaces/pagination.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existingByEmail = await this.userRepository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new ConflictException(ERROR_MESSAGES.USER.EMAIL_EXISTS);
    }

    const existingByClerkId = await this.userRepository.findByClerkId(
      dto.clerkId,
    );
    if (existingByClerkId) {
      throw new ConflictException(ERROR_MESSAGES.USER.CLERK_ID_EXISTS);
    }

    return this.userRepository.create(dto);
  }

  async findAll(query: QueryParams): Promise<PaginatedResult<User>> {
    const result = await this.userRepository.findAll(query);
    const { totalCount, pageCount } = result.meta;

    if (totalCount > 0 && query.page > pageCount) {
      throw new BadRequestException(ERROR_MESSAGES.USER.PAGE_OUT_OF_RANGE);
    }

    return result;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    return user;
  }

  async findByClerkId(clerkId: string): Promise<User> {
    const user = await this.userRepository.findByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
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

  async softDelete(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.deletedAt = new Date();
    await this.userRepository.save(user);
  }
}
