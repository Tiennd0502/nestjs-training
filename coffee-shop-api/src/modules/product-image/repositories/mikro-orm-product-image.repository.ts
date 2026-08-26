import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { ProductImage } from '../entities/product-image.entity';
import {
  CreateProductImageData,
  ProductImageRepository,
} from './product-image-repository.interface';

@Injectable()
export class MikroOrmProductImageRepository implements ProductImageRepository {
  constructor(
    @InjectRepository(ProductImage)
    private readonly repository: EntityRepository<ProductImage>,
    private readonly em: EntityManager,
  ) {}

  findById(id: string): Promise<ProductImage | null> {
    return this.repository.findOne({ id });
  }

  findAllByProduct(productId: string): Promise<ProductImage[]> {
    return this.repository.find({ product: productId });
  }

  async create(data: CreateProductImageData): Promise<ProductImage> {
    const image = this.repository.create({
      product: data.productId,
      url: data.url,
      isPrimary: data.isPrimary,
      sortOrder: data.sortOrder,
    });
    await this.em.persist(image).flush();

    return image;
  }

  async save(image: ProductImage): Promise<void> {
    await this.em.persist(image).flush();
  }
}
