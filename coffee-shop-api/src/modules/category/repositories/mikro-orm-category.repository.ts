import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Category } from '../entities/category.entity';
import {
  CategoryRepository,
  CreateCategoryData,
  FindOptions,
} from './category-repository.interface';
import {
  PaginatedResult,
  QueryParams,
} from '../../../common/interfaces/pagination.interface';

@Injectable()
export class MikroOrmCategoryRepository implements CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: EntityRepository<Category>,
    private readonly em: EntityManager,
  ) {}

  findById(id: string, options?: FindOptions): Promise<Category | null> {
    return this.repository.findOne(
      { id },
      { filters: { softDelete: !options?.includeDeleted } },
    );
  }

  findByName(name: string, options?: FindOptions): Promise<Category | null> {
    return this.repository.findOne(
      { name },
      { filters: { softDelete: !options?.includeDeleted } },
    );
  }

  async findAll(
    query: QueryParams,
    options?: FindOptions,
  ): Promise<PaginatedResult<Category>> {
    const { page, limit, search } = query;
    const where = search
      ? {
          $or: [
            { name: { $ilike: `%${search}%` } },
            { slug: { $ilike: `%${search}%` } },
          ],
        }
      : {};

    const [data, totalCount] = await this.repository.findAndCount(where, {
      limit,
      offset: (page - 1) * limit,
      filters: { softDelete: !options?.includeDeleted },
    });

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

  async create(data: CreateCategoryData): Promise<Category> {
    const category = this.repository.create(data);
    await this.em.persist(category).flush();

    return category;
  }

  async save(category: Category): Promise<void> {
    await this.em.persist(category).flush();
  }
}
