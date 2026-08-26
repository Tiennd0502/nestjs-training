import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Product } from '../entities/product.entity';
import {
  CreateProductData,
  ProductRepository,
} from './product-repository.interface';
import {
  PaginatedResult,
  QueryParams,
} from '../../../common/interfaces/pagination.interface';

@Injectable()
export class MikroOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: EntityRepository<Product>,
    private readonly em: EntityManager,
  ) {}

  findById(id: string): Promise<Product | null> {
    return this.repository.findOne(
      { id },
      { populate: ['images', 'variants'] },
    );
  }

  findByName(name: string): Promise<Product | null> {
    return this.repository.findOne({ name });
  }

  async findAll(query: QueryParams): Promise<PaginatedResult<Product>> {
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
      populate: ['images', 'variants'],
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

  async create(data: CreateProductData): Promise<Product> {
    const product = this.repository.create({
      category: data.categoryId,
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      roastLevel: data.roastLevel ?? null,
      isOrganic: data.isOrganic,
      isFairTrade: data.isFairTrade,
      status: data.status,
      tastingNotes: data.tastingNotes ?? null,
      origin: data.origin ?? null,
      processingMethod: data.processingMethod ?? null,
    });
    await this.em.persist(product).flush();

    return product;
  }

  async save(product: Product): Promise<void> {
    await this.em.persist(product).flush();
  }
}
