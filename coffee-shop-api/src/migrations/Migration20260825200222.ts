import { Migration } from '@mikro-orm/migrations';

export class Migration20260825200222 extends Migration {
  // eslint-disable-next-line @typescript-eslint/require-await -- MikroORM's Migration base class requires an async override; addSql() itself is synchronous.
  override async up(): Promise<void> {
    this.addSql(
      `create table "products" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, "category_id" uuid not null, "name" varchar(255) not null, "slug" varchar(255) not null, "description" varchar(255) null, "roast_level" text check ("roast_level" in ('LIGHT', 'MEDIUM', 'DARK')) null, "is_organic" boolean not null default false, "is_fair_trade" boolean not null default false, "status" text check ("status" in ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED')) not null default 'DRAFT', "tasting_notes" varchar(255) null, "origin" varchar(255) null, "processing_method" varchar(255) null, constraint "products_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "products" add constraint "products_name_unique" unique ("name");`,
    );

    this.addSql(
      `create table "product_images" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, "product_id" uuid not null, "url" varchar(255) not null, "is_primary" boolean not null default false, "sort_order" int not null default 0, constraint "product_images_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "product_variants" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, "product_id" uuid not null, "sku" varchar(255) not null, "weight" numeric(10,3) not null, "unit" text check ("unit" in ('KG', 'G', 'ML', 'L')) not null, "name" varchar(255) not null, "price" numeric(10,2) not null, "discount_type" text check ("discount_type" in ('PERCENT', 'FIXED')) null, "discount_value" numeric(10,2) null, "quantity" int not null default 0, constraint "product_variants_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "product_variants" add constraint "product_variants_sku_unique" unique ("sku");`,
    );

    this.addSql(
      `alter table "products" add constraint "products_category_id_foreign" foreign key ("category_id") references "categories" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "product_images" add constraint "product_images_product_id_foreign" foreign key ("product_id") references "products" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "product_variants" add constraint "product_variants_product_id_foreign" foreign key ("product_id") references "products" ("id") on update cascade;`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- MikroORM's Migration base class requires an async override; addSql() itself is synchronous.
  override async down(): Promise<void> {
    this.addSql(
      `alter table "product_images" drop constraint "product_images_product_id_foreign";`,
    );

    this.addSql(
      `alter table "product_variants" drop constraint "product_variants_product_id_foreign";`,
    );

    this.addSql(`drop table if exists "products" cascade;`);

    this.addSql(`drop table if exists "product_images" cascade;`);

    this.addSql(`drop table if exists "product_variants" cascade;`);
  }
}
