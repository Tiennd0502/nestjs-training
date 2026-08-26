import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProductVariantService } from './services/product-variant.service';
import { ProductVariant } from './entities/product-variant.entity';
import { PRODUCT_VARIANT_REPOSITORY } from './repositories/product-variant-repository.interface';
import { MikroOrmProductVariantRepository } from './repositories/mikro-orm-product-variant.repository';

@Module({
  imports: [MikroOrmModule.forFeature([ProductVariant])],
  providers: [
    ProductVariantService,
    {
      provide: PRODUCT_VARIANT_REPOSITORY,
      useClass: MikroOrmProductVariantRepository,
    },
  ],
  exports: [ProductVariantService],
})
export class ProductVariantModule {}
