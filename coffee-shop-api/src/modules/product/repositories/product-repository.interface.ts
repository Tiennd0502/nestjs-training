import { Product } from '../entities/product.entity';
import { RoastLevel, ProductStatus } from '../enums/product.enum';
import {
  PaginatedResult,
  QueryParams,
} from '../../../common/interfaces/pagination.interface';

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

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findByName(name: string): Promise<Product | null>;
  findAll(query: QueryParams): Promise<PaginatedResult<Product>>;
  create(data: CreateProductData): Promise<Product>;
  save(product: Product): Promise<void>;
}
