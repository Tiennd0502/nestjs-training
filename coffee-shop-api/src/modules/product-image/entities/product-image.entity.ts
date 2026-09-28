import { Opt } from '@mikro-orm/core';
import { Entity, ManyToOne, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from '../../product/entities/product.entity';

@Entity({ tableName: 'product_images' })
export class ProductImage extends BaseEntity {
  @ManyToOne(() => Product, { updateRule: 'cascade' })
  product!: Product;

  @Property({ type: 'string' })
  url!: string;

  @Property({ type: 'boolean', fieldName: 'is_primary' })
  isPrimary: boolean & Opt = false;

  @Property({ type: 'number', fieldName: 'sort_order' })
  sortOrder: number & Opt = 0;
}
