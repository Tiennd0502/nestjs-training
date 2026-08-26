import { ProductVariant } from '../entities/product-variant.entity';
import { DiscountType, ProductUnit } from '../enums/product-variant.enum';

export const PRODUCT_VARIANT_REPOSITORY = Symbol('PRODUCT_VARIANT_REPOSITORY');

export interface CreateProductVariantData {
  productId: string;
  sku: string;
  weight: string;
  unit: ProductUnit;
  name: string;
  price: string;
  discountType?: DiscountType | null;
  discountValue?: string | null;
  quantity?: number;
}

export interface ProductVariantRepository {
  findById(id: string): Promise<ProductVariant | null>;
  findBySku(sku: string): Promise<ProductVariant | null>;
  findAllByProduct(productId: string): Promise<ProductVariant[]>;
  create(data: CreateProductVariantData): Promise<ProductVariant>;
  save(variant: ProductVariant): Promise<void>;
}
