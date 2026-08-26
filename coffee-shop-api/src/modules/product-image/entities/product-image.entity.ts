import { Entity, ManyToOne, Opt, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from '../../product/entities/product.entity';

@Entity({ tableName: 'product_images' })
export class ProductImage extends BaseEntity {
  @ManyToOne(() => Product)
  product!: Product;

  @Property()
  url!: string;

  @Property({ fieldName: 'is_primary' })
  isPrimary: boolean & Opt = false;

  @Property({ fieldName: 'sort_order' })
  sortOrder: number & Opt = 0;
}
