import { Product } from '../entities/product.entity.js';
import {
  RoastLevel,
  ProductStatus,
  ProductSortBy,
} from '../enums/product.enum.js';
import { PaginatedResult } from '../../../common/dto/pagination.dto.js';
import { QueryParams } from '../../../common/dto/query-params.dto.js';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface CreateProductData {
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  roastLevel?: RoastLevel | null;
  isOrganic?: boolean;
  isFairTrade?: boolean;
  status?: ProductStatus;
  tastingNotes?: string | null;
  origin?: string | null;
  processingMethod?: string | null;
}

export interface ProductFilters {
  categoryId?: string;
  status?: ProductStatus;
  roastLevels?: RoastLevel[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSortBy;
}

export interface FindOptions {
  includeDeleted?: boolean;
}

export interface ProductRepository {
  findById(id: string, options?: FindOptions): Promise<Product | null>;
  findByName(name: string, options?: FindOptions): Promise<Product | null>;
  findAll(
    query: QueryParams,
    filters?: ProductFilters,
    options?: FindOptions,
  ): Promise<PaginatedResult<Product>>;
  create(data: CreateProductData): Promise<Product>;
  save(product: Product): Promise<void>;
}
