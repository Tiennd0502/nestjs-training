import { Category } from '../entities/category.entity';
import {
  PaginatedResult,
  QueryParams,
} from '../../../common/interfaces/pagination.interface';

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
