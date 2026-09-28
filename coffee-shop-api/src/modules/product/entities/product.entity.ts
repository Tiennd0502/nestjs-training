import { Collection, Opt } from '@mikro-orm/core';
import {
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/decorators/legacy';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Category } from '../../category/entities/category.entity.js';
import { ProductImage } from '../../product-image/entities/product-image.entity.js';
import { ProductVariant } from '../../product-variant/entities/product-variant.entity.js';
import { RoastLevel, ProductStatus } from '../enums/product.enum.js';

@Entity({ tableName: 'products' })
export class Product extends BaseEntity {
  @ManyToOne(() => Category, { updateRule: 'cascade' })
  category!: Category;

  @Property({ type: 'string' })
  @Unique()
  name!: string;

  @Property({ type: 'string' })
  slug!: string;

  @Property({ type: 'string', nullable: true })
  description: string | null = null;

  @Enum({ items: () => RoastLevel, fieldName: 'roast_level', nullable: true })
  roastLevel: RoastLevel | null = null;

  @Property({ type: 'boolean', fieldName: 'is_organic' })
  isOrganic: boolean & Opt = false;

  @Property({ type: 'boolean', fieldName: 'is_fair_trade' })
  isFairTrade: boolean & Opt = false;

  @Enum({ items: () => ProductStatus })
  status: ProductStatus & Opt = ProductStatus.DRAFT;

  @Property({ type: 'string', fieldName: 'tasting_notes', nullable: true })
  tastingNotes: string | null = null;

  @Property({ type: 'string', nullable: true })
  origin: string | null = null;

  @Property({ type: 'string', fieldName: 'processing_method', nullable: true })
  processingMethod: string | null = null;

  @OneToMany(() => ProductImage, (image) => image.product)
  images = new Collection<ProductImage>(this);

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants = new Collection<ProductVariant>(this);
}
