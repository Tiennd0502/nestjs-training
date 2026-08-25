import { v4 as uuidv4 } from 'uuid';
import { Entity, Filter, Opt, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ abstract: true })
@Filter({ name: 'softDelete', cond: { deletedAt: null }, default: true })
export abstract class BaseEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string & Opt = uuidv4();

  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  @Property({ type: Date, nullable: true })
  deletedAt: Date | null = null;
}
