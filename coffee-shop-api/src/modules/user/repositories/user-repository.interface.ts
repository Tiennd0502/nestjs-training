import { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type CreateUserData = Pick<
  User,
  'clerkId' | 'email' | 'firstName' | 'lastName'
> &
  Partial<Pick<User, 'phoneNumber' | 'avatarUrl' | 'role'>>;

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByClerkId(clerkId: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(data: CreateUserData): Promise<User>;
  save(user: User): Promise<void>;
}
