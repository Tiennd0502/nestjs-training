import { User } from '../entities/user.entity.js';
import { PaginatedResult } from '../../../common/dto/pagination.dto.js';
import { QueryParams } from '../../../common/dto/query-params.dto.js';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type CreateUserData = Pick<
  User,
  'clerkId' | 'email' | 'firstName' | 'lastName'
> &
  Partial<Pick<User, 'phoneNumber' | 'avatarUrl' | 'role'>>;

export interface FindOptions {
  includeDeleted?: boolean;
  excludeUserId?: string;
}

export interface UserRepository {
  findById(id: string, options?: FindOptions): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByClerkId(clerkId: string): Promise<User | null>;
  findAll(
    query: QueryParams,
    options?: FindOptions,
  ): Promise<PaginatedResult<User>>;
  create(data: CreateUserData): Promise<User>;
  save(user: User): Promise<void>;
}
