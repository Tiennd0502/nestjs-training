import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { User } from '../entities/user.entity';
import { CreateUserData, UserRepository } from './user-repository.interface';
import {
  PaginatedResult,
  QueryParams,
} from '../../../common/interfaces/pagination.interface';

@Injectable()
export class MikroOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: EntityRepository<User>,
    private readonly em: EntityManager,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.repository.findOne({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ email });
  }

  findByClerkId(clerkId: string): Promise<User | null> {
    return this.repository.findOne({ clerkId });
  }

  async findAll(query: QueryParams): Promise<PaginatedResult<User>> {
    const { page, limit } = query;
    const [data, totalCount] = await this.repository.findAndCount(
      {},
      { limit, offset: (page - 1) * limit },
    );

    return {
      data,
      meta: {
        limit,
        currentPage: page,
        pageCount: Math.ceil(totalCount / limit),
        totalCount,
      },
    };
  }

  async create(data: CreateUserData): Promise<User> {
    const user = this.repository.create(data);
    await this.em.persist(user).flush();

    return user;
  }

  async save(user: User): Promise<void> {
    await this.em.persist(user).flush();
  }
}
