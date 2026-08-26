import {
  Entity,
  Enum,
  ManyToOne,
  Opt,
  Property,
  Unique,
} from '@mikro-orm/core';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from '../../product/entities/product.entity';
import { DiscountType, ProductUnit } from '../enums/product-variant.enum';

@Entity({ tableName: 'product_variants' })
export class ProductVariant extends BaseEntity {
  @ManyToOne(() => Product)
  product!: Product;

  @Property()
  @Unique()
  sku!: string;

  @Property({ type: 'decimal', precision: 10, scale: 3 })
  weight!: string;

  @Enum({ items: () => ProductUnit })
  unit!: ProductUnit;

  @Property()
  name!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Enum({
    items: () => DiscountType,
    fieldName: 'discount_type',
    nullable: true,
  })
  discountType: DiscountType | null = null;

  @Property({
    type: 'decimal',
    precision: 10,
    scale: 2,
    fieldName: 'discount_value',
    nullable: true,
  })
  discountValue: string | null = null;

  @Property()
  quantity: number & Opt = 0;
}
