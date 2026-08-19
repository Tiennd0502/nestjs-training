// Example shape for a MikroORM entity — see .claude/rules/coding.md "Persistence (MikroORM)".
// Illustrative only: @mikro-orm/* packages are not yet installed in this project.
import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  @Unique()
  email!: string;

  @Property()
  passwordHash!: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}
