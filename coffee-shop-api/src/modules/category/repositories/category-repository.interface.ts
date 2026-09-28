import { Category } from '../entities/category.entity.js';
import { PaginatedResult } from '../../../common/dto/pagination.dto.js';
import { QueryParams } from '../../../common/dto/query-params.dto.js';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface CreateCategoryData {
  name: string;
  slug: string;
}

export interface FindOptions {
  includeDeleted?: boolean;
}

export interface CategoryRepository {
  findById(id: string, options?: FindOptions): Promise<Category | null>;
  findByName(name: string, options?: FindOptions): Promise<Category | null>;
  findAll(
    query: QueryParams,
    options?: FindOptions,
  ): Promise<PaginatedResult<Category>>;
  create(data: CreateCategoryData): Promise<Category>;
  save(category: Category): Promise<void>;
}
