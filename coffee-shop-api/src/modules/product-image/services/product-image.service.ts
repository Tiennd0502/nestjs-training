import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductImage } from '../entities/product-image.entity';
import {
  CreateProductImageData,
  PRODUCT_IMAGE_REPOSITORY,
  type ProductImageRepository,
} from '../repositories/product-image-repository.interface';
import { ERROR_MESSAGES } from '../../../common/constants/message.constant';

@Injectable()
export class ProductImageService {
  constructor(
    @Inject(PRODUCT_IMAGE_REPOSITORY)
    private readonly productImageRepository: ProductImageRepository,
  ) {}

  create(data: CreateProductImageData): Promise<ProductImage> {
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
