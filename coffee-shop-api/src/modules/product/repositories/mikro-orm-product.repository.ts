import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Product } from '../entities/product.entity';
import { ProductSortBy } from '../enums/product.enum';
import {
  CreateProductData,
  ProductFilters,
  ProductRepository,
} from './product-repository.interface';
import {
  PaginatedResult,
  QueryParams,
} from '../../../common/interfaces/pagination.interface';

const minVariantPrice = (product: Product): number => {
  const prices = product.variants
    .getItems()
    .map((variant) => Number(variant.price));
  return prices.length > 0 ? Math.min(...prices) : Number.POSITIVE_INFINITY;
};

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

  async findAll(
    query: QueryParams,
    filters: ProductFilters = {},
  ): Promise<PaginatedResult<Product>> {
    const { page, limit, search } = query;
    const { categoryId, status, roastLevels, minPrice, maxPrice, sortBy } =
      filters;

    const conditions: object[] = [];
    if (search) {
      conditions.push({
        $or: [
          { name: { $ilike: `%${search}%` } },
          { slug: { $ilike: `%${search}%` } },
        ],
      });
    }
    if (categoryId) conditions.push({ category: categoryId });
    if (status) conditions.push({ status });
    if (roastLevels && roastLevels.length > 0) {
      conditions.push({ roastLevel: { $in: roastLevels } });
    }
    const where = conditions.length > 0 ? { $and: conditions } : {};

    const nameOrderBy =
      sortBy === ProductSortBy.NAME_ASC
        ? ({ name: 'ASC' } as const)
        : sortBy === ProductSortBy.NAME_DESC
          ? ({ name: 'DESC' } as const)
          : undefined;

    const needsPricePass =
      minPrice !== undefined ||
      maxPrice !== undefined ||
      sortBy === ProductSortBy.PRICE_ASC ||
      sortBy === ProductSortBy.PRICE_DESC;

    if (!needsPricePass) {
      const [data, totalCount] = await this.repository.findAndCount(where, {
        limit,
        offset: (page - 1) * limit,
        populate: ['images', 'variants'],
        ...(nameOrderBy ? { orderBy: nameOrderBy } : {}),
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

    let candidates = await this.repository.find(where, {
      populate: ['images', 'variants'],
      ...(nameOrderBy ? { orderBy: nameOrderBy } : {}),
    });

    if (minPrice !== undefined || maxPrice !== undefined) {
      candidates = candidates.filter((product) =>
        product.variants.getItems().some((variant) => {
          const price = Number(variant.price);
          return (
            (minPrice === undefined || price >= minPrice) &&
            (maxPrice === undefined || price <= maxPrice)
          );
        }),
      );
    }

    if (
      sortBy === ProductSortBy.PRICE_ASC ||
      sortBy === ProductSortBy.PRICE_DESC
    ) {
      const direction = sortBy === ProductSortBy.PRICE_ASC ? 1 : -1;
      candidates = [...candidates].sort((a, b) => {
        const priceA = minVariantPrice(a);
        const priceB = minVariantPrice(b);
        if (priceA === priceB) return 0;
        if (priceA === Number.POSITIVE_INFINITY) return 1;
        if (priceB === Number.POSITIVE_INFINITY) return -1;
        return (priceA - priceB) * direction;
      });
    }

    const totalCount = candidates.length;
    const offset = (page - 1) * limit;
    const data = candidates.slice(offset, offset + limit);

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
