import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Opt,
  Property,
  Unique,
} from '@mikro-orm/core';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Category } from '../../category/entities/category.entity';
import { ProductImage } from '../../product-image/entities/product-image.entity';
import { ProductVariant } from '../../product-variant/entities/product-variant.entity';
import { RoastLevel, ProductStatus } from '../enums/product.enum';

@Entity({ tableName: 'products' })
export class Product extends BaseEntity {
  @ManyToOne(() => Category)
  category!: Category;

  @Property()
  @Unique()
  name!: string;

  @Property()
  slug!: string;

  @Property({ nullable: true })
  description: string | null = null;

  @Enum({ items: () => RoastLevel, fieldName: 'roast_level', nullable: true })
  roastLevel: RoastLevel | null = null;

  @Property({ fieldName: 'is_organic' })
  isOrganic: boolean & Opt = false;

  @Property({ fieldName: 'is_fair_trade' })
  isFairTrade: boolean & Opt = false;

  @Enum({ items: () => ProductStatus })
  status: ProductStatus & Opt = ProductStatus.DRAFT;

  @Property({ fieldName: 'tasting_notes', nullable: true })
  tastingNotes: string | null = null;

  @Property({ nullable: true })
  origin: string | null = null;

  @Property({ fieldName: 'processing_method', nullable: true })
  processingMethod: string | null = null;

  @OneToMany(() => ProductImage, (image) => image.product)
  images = new Collection<ProductImage>(this);

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants = new Collection<ProductVariant>(this);
}
