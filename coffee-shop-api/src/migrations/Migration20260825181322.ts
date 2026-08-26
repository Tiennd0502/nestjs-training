import { Migration } from '@mikro-orm/migrations';

export class Migration20260825181322 extends Migration {
  // eslint-disable-next-line @typescript-eslint/require-await -- MikroORM's Migration base class requires an async override; addSql() itself is synchronous.
  override async up(): Promise<void> {
    this.addSql(
      `create table "categories" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, "name" varchar(255) not null, "slug" varchar(255) not null, constraint "categories_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "categories" add constraint "categories_name_unique" unique ("name");`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- MikroORM's Migration base class requires an async override; addSql() itself is synchronous.
  override async down(): Promise<void> {
    this.addSql(`drop table if exists "categories" cascade;`);
  }
}
