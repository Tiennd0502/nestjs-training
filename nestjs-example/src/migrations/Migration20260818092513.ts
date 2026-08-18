import { Migration } from '@mikro-orm/migrations';

export class Migration20260818092513 extends Migration {
  override up(): Promise<void> {
    this.addSql(
      `create table "users" ("id" serial primary key, "email" varchar(255) not null, "password_hash" varchar(255) not null, "name" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`,
    );
    this.addSql(
      `alter table "users" add constraint "users_email_unique" unique ("email");`,
    );
    return Promise.resolve();
  }

  override down(): Promise<void> {
    this.addSql(`drop table if exists "users" cascade;`);
    return Promise.resolve();
  }
}
