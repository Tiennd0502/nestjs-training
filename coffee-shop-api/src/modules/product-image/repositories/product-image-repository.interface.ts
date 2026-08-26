import { ProductImage } from '../entities/product-image.entity';

export const PRODUCT_IMAGE_REPOSITORY = Symbol('PRODUCT_IMAGE_REPOSITORY');

export interface CreateProductImageData {
  productId: string;
  url: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductImageRepository {
  findById(id: string): Promise<ProductImage | null>;
  findAllByProduct(productId: string): Promise<ProductImage[]>;
  create(data: CreateProductImageData): Promise<ProductImage>;
  save(image: ProductImage): Promise<void>;
}
