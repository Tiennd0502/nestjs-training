import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductImage } from '../entities/product-image.entity.js';
import type { CreateProductImageInput } from '../dto/product-image.schema.js';
import { ProductImageRepository } from '../repositories/product-image.repository.js';
import { ERROR_MESSAGES } from '../../../common/constants/message.constant.js';

@Injectable()
export class ProductImageService {
  constructor(
    private readonly productImageRepository: ProductImageRepository,
  ) {}

  create(
    data: CreateProductImageInput & { productId: string },
  ): Promise<ProductImage> {
    return this.productImageRepository.create(data);
  }

  findAllByProduct(productId: string): Promise<ProductImage[]> {
    return this.productImageRepository.findAllByProduct(productId);
  }

  async findOne(id: string): Promise<ProductImage> {
    const image = await this.productImageRepository.findById(id);
    if (!image) {
      throw new NotFoundException(ERROR_MESSAGES.PRODUCT_IMAGE.NOT_FOUND);
    }

    return image;
  }

  async remove(id: string): Promise<void> {
    const image = await this.findOne(id);
    image.deletedAt = new Date();
    await this.productImageRepository.save(image);
  }
}
