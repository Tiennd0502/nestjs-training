import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { Product } from './entities/product.entity';
import { PRODUCT_REPOSITORY } from './repositories/product-repository.interface';
import { MikroOrmProductRepository } from './repositories/mikro-orm-product.repository';
import { CategoryModule } from '../category/category.module';
import { ProductImageModule } from '../product-image/product-image.module';
import { ProductVariantModule } from '../product-variant/product-variant.module';

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
