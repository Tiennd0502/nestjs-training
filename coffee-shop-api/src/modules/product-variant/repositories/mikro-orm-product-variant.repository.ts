import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { ProductVariant } from '../entities/product-variant.entity';
import {
  CreateProductVariantData,
  ProductVariantRepository,
} from './product-variant-repository.interface';

@Injectable()
export class MikroOrmProductVariantRepository implements ProductVariantRepository {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly repository: EntityRepository<ProductVariant>,
    private readonly em: EntityManager,
  ) {}

  findById(id: string): Promise<ProductVariant | null> {
    return this.repository.findOne({ id });
  }

  findBySku(sku: string): Promise<ProductVariant | null> {
    return this.repository.findOne({ sku });
  }

  findAllByProduct(productId: string): Promise<ProductVariant[]> {
    return this.repository.find({ product: productId });
  }

  async create(data: CreateProductVariantData): Promise<ProductVariant> {
    const variant = this.repository.create({
      product: data.productId,
      sku: data.sku,
      weight: data.weight,
      unit: data.unit,
      name: data.name,
      price: data.price,
      discountType: data.discountType ?? null,
      discountValue: data.discountValue ?? null,
      quantity: data.quantity,
    });
    await this.em.persist(variant).flush();

    return variant;
  }

  async save(variant: ProductVariant): Promise<void> {
    await this.em.persist(variant).flush();
  }
}
