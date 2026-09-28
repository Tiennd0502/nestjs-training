import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProductService } from './services/product.service.js';
import { ProductController } from './controllers/product.controller.js';
import { Product } from './entities/product.entity.js';
import { PRODUCT_REPOSITORY } from './repositories/product-repository.interface.js';
import { MikroOrmProductRepository } from './repositories/mikro-orm-product.repository.js';
import { CategoryModule } from '../category/category.module.js';
import { ProductImageModule } from '../product-image/product-image.module.js';
import { ProductVariantModule } from '../product-variant/product-variant.module.js';

@Module({
  imports: [
    MikroOrmModule.forFeature([Product]),
    CategoryModule,
    ProductImageModule,
    ProductVariantModule,
  ],
  providers: [
    ProductService,
    { provide: PRODUCT_REPOSITORY, useClass: MikroOrmProductRepository },
  ],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
