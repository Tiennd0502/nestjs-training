import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity({ tableName: 'categories' })
export class Category extends BaseEntity {
  @Property()
  @Unique()
  name!: string;

  @Property()
  slug!: string;
}
