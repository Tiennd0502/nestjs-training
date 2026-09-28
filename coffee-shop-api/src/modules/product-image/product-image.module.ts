import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProductImageService } from './services/product-image.service.js';
import { ProductImage } from './entities/product-image.entity.js';
import { PRODUCT_IMAGE_REPOSITORY } from './repositories/product-image-repository.interface.js';
import { MikroOrmProductImageRepository } from './repositories/mikro-orm-product-image.repository.js';

@Module({
  imports: [MikroOrmModule.forFeature([ProductImage])],
  providers: [
    ProductImageService,
    {
      provide: PRODUCT_IMAGE_REPOSITORY,
      useClass: MikroOrmProductImageRepository,
    },
  ],
  exports: [ProductImageService],
})
export class ProductImageModule {}
