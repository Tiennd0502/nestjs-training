import { Migration } from '@mikro-orm/migrations';

export class Migration20260824081651 extends Migration {
  // eslint-disable-next-line @typescript-eslint/require-await -- MikroORM's Migration base class requires an async override; addSql() itself is synchronous.
  override async up(): Promise<void> {
    this.addSql(
      `create table "users" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, "clerk_id" varchar(255) not null, "email" varchar(255) not null, "role" text check ("role" in ('ADMIN', 'USER')) not null default 'USER', "first_name" varchar(255) not null, "last_name" varchar(255) not null, "phone_number" varchar(255) null, "avatar_url" varchar(255) null, "status" text check ("status" in ('ACTIVE', 'INACTIVE')) not null default 'ACTIVE', constraint "users_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "users" add constraint "users_clerk_id_unique" unique ("clerk_id");`,
    );
    this.addSql(
      `alter table "users" add constraint "users_email_unique" unique ("email");`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- MikroORM's Migration base class requires an async override; addSql() itself is synchronous.
  override async down(): Promise<void> {
    this.addSql(`drop table if exists "users" cascade;`);
  }
}
