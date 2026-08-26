import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProductImageService } from './services/product-image.service';
import { ProductImage } from './entities/product-image.entity';
import { PRODUCT_IMAGE_REPOSITORY } from './repositories/product-image-repository.interface';
import { MikroOrmProductImageRepository } from './repositories/mikro-orm-product-image.repository';

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
