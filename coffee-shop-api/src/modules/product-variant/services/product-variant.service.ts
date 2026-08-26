import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductVariant } from '../entities/product-variant.entity';
import {
  CreateProductVariantData,
  PRODUCT_VARIANT_REPOSITORY,
  type ProductVariantRepository,
} from '../repositories/product-variant-repository.interface';
import { ERROR_MESSAGES } from '../../../common/constants/message.constant';
import { DiscountType, ProductUnit } from '../enums/product-variant.enum';

export type CreateProductVariantInput = Omit<CreateProductVariantData, 'name'>;

export interface UpdateProductVariantData {
  sku?: string;
  weight?: string;
  unit?: ProductUnit;
  price?: string;
  discountType?: DiscountType | null;
  discountValue?: string | null;
  quantity?: number;
}

const variantNameFrom = (weight: string, unit: ProductUnit): string =>
  `${weight}${unit}`;

@Injectable()
export class ProductVariantService {
  constructor(
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly productVariantRepository: ProductVariantRepository,
  ) {}

  async create(data: CreateProductVariantInput): Promise<ProductVariant> {
    const existing = await this.productVariantRepository.findBySku(data.sku);
    if (existing) {
      throw new ConflictException(ERROR_MESSAGES.PRODUCT_VARIANT.SKU_EXISTS);
    }

    return this.productVariantRepository.create({
      ...data,
      name: variantNameFrom(data.weight, data.unit),
    });
  }

  findAllByProduct(productId: string): Promise<ProductVariant[]> {
    return this.productVariantRepository.findAllByProduct(productId);
  }

  async findOne(id: string): Promise<ProductVariant> {
    const variant = await this.productVariantRepository.findById(id);
    if (!variant) {
      throw new NotFoundException(ERROR_MESSAGES.PRODUCT_VARIANT.NOT_FOUND);
    }

    return variant;
  }

  async update(
    id: string,
    data: UpdateProductVariantData,
  ): Promise<ProductVariant> {
    const variant = await this.findOne(id);

    if (data.sku !== undefined && data.sku !== variant.sku) {
      const existing = await this.productVariantRepository.findBySku(data.sku);
      if (existing && existing.id !== id) {
        throw new ConflictException(ERROR_MESSAGES.PRODUCT_VARIANT.SKU_EXISTS);
      }
    }

    Object.assign(
      variant,
      Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined),
      ),
    );
    if (data.weight !== undefined || data.unit !== undefined) {
      variant.name = variantNameFrom(variant.weight, variant.unit);
    }
    await this.productVariantRepository.save(variant);

    return variant;
  }

  async remove(id: string): Promise<void> {
    const variant = await this.findOne(id);
    variant.deletedAt = new Date();
    await this.productVariantRepository.save(variant);
  }
}
