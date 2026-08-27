import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import request from 'supertest';
import { App } from 'supertest/types';
import { getAuth } from '@clerk/express';
import { AppModule } from './../../src/app.module';
import { UserService } from './../../src/modules/user/services/user.service';
import { CategoryService } from './../../src/modules/category/services/category.service';
import { ProductService } from './../../src/modules/product/services/product.service';
import { ProductImageService } from './../../src/modules/product-image/services/product-image.service';
import { ProductVariantService } from './../../src/modules/product-variant/services/product-variant.service';
import { UserRole } from './../../src/common/enums/user.enum';
import { API_BASE_PATH } from './../utils/api-path.util';
import { initTestApp } from './../utils/init-test-app.util';
import { ProductUnit } from './../../src/modules/product-variant/enums/product-variant.enum';
import type { User } from './../../src/modules/user/entities/user.entity';
import type { Category } from './../../src/modules/category/entities/category.entity';
import { slugFrom } from './../../src/common/utils/slug.util';

jest.mock('@clerk/express', () => {
  const actual: object = jest.requireActual('@clerk/express');
  return { ...actual, getAuth: jest.fn() };
});

describe('ProductController (e2e)', () => {
  let app: INestApplication<App>;
  let orm: MikroORM;
  let userService: UserService;
  let categoryService: CategoryService;
  let productService: ProductService;
  let productImageService: ProductImageService;
  let productVariantService: ProductVariantService;
  const createdUserIds: string[] = [];
  const createdCategoryIds: string[] = [];
  const createdProductIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await initTestApp(moduleFixture);

    orm = app.get(MikroORM);
    userService = app.get(UserService);
    categoryService = app.get(CategoryService);
    productService = app.get(ProductService);
    productImageService = app.get(ProductImageService);
    productVariantService = app.get(ProductVariantService);
  });

  afterAll(async () => {
    await RequestContext.create(orm.em, async () => {
      for (const id of createdProductIds) {
        await productService.remove(id).catch(() => undefined);
      }
      for (const id of createdCategoryIds) {
        await categoryService.remove(id).catch(() => undefined);
      }
      for (const id of createdUserIds) {
        await userService.softDelete(id).catch(() => undefined);
      }
    });
    await app.close();
  });

  beforeEach(() => {
    (getAuth as jest.Mock).mockReturnValue({ userId: null });
  });

  const uniqueName = (base: string): string =>
    `${base} ${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const createTestUser = async (role: UserRole): Promise<User> =>
    RequestContext.create(orm.em, async () => {
      const clerkId = `clerk-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const user = await userService.create({
        clerkId,
        email: `${clerkId}@example.com`,
        firstName: 'E2E',
        lastName: 'Test',
        role,
      });
      createdUserIds.push(user.id);
      return user;
    });

  const createTestCategory = async (): Promise<Category> =>
    RequestContext.create(orm.em, async () => {
      const category = await categoryService.create({
        name: uniqueName('Coffee Category E2E'),
      });
      createdCategoryIds.push(category.id);
      return category;
    });

  const mockSessionFor = (clerkId: string | null): void => {
    (getAuth as jest.Mock).mockReturnValue({ userId: clerkId });
  };

  describe('public GET routes', () => {
    it('GET /products responds 200 with the paginated envelope, no session required', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_BASE_PATH}/products`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });

    it('GET /products/:id responds 200 for an existing product, no session required', async () => {
      const category = await createTestCategory();
      const name = uniqueName('Ethiopia Yirgacheffe E2E');
      const product = await RequestContext.create(orm.em, () =>
        productService.create({ categoryId: category.id, name }),
      );
      createdProductIds.push(product.id);

      const response = await request(app.getHttpServer())
        .get(`${API_BASE_PATH}/products/${product.id}`)
        .expect(200);

      const body = response.body as {
        data: { categoryId: string; images: unknown[]; variants: unknown[] };
      };
      expect(body.data).toMatchObject({
        id: product.id,
        categoryId: category.id,
        name,
        slug: slugFrom(name),
      });
      expect(body.data.images).toEqual([]);
      expect(body.data.variants).toEqual([]);
    });

    it('GET /products/:id responds 404 for a missing product', async () => {
      await request(app.getHttpServer())
        .get(`${API_BASE_PATH}/products/00000000-0000-0000-0000-000000000000`)
        .expect(404);
    });
  });

  describe('mutating routes without a Clerk session', () => {
    it.each([
      ['post', `${API_BASE_PATH}/products`],
      ['patch', `${API_BASE_PATH}/products/some-id`],
      ['delete', `${API_BASE_PATH}/products/some-id`],
    ])('%s %s responds 401', async (method, path) => {
      await (
        request(app.getHttpServer()) as unknown as Record<
          string,
          (path: string) => request.Test
        >
      )
        [method](path)
        .send({ name: 'Whatever' })
        .expect(401);
    });
  });

  describe('mutating routes with an authenticated non-ADMIN user', () => {
    it('POST /products responds 403', async () => {
      const user = await createTestUser(UserRole.USER);
      const category = await createTestCategory();
      mockSessionFor(user.clerkId);

      await request(app.getHttpServer())
        .post(`${API_BASE_PATH}/products`)
        .send({ categoryId: category.id, name: 'Non Admin Product' })
        .expect(403);
    });
  });

  describe('mutating routes with an authenticated ADMIN user', () => {
    it('POST /products responds 201, derives a slug, and creates the supplied images and variants', async () => {
      const admin = await createTestUser(UserRole.ADMIN);
      const category = await createTestCategory();
      mockSessionFor(admin.clerkId);
      const name = uniqueName('Guatemala Antigua E2E');
      const sku = uniqueName('SKU-E2E');

      const response = await request(app.getHttpServer())
        .post(`${API_BASE_PATH}/products`)
        .send({
          categoryId: category.id,
          name,
          images: [{ url: 'https://example.com/coffee.jpg', isPrimary: true }],
          variants: [
            {
              sku,
              weight: 250,
              unit: ProductUnit.G,
              price: 12.5,
            },
          ],
        })
        .expect(201);

      const body = response.body as { data: { id: string } };
      createdProductIds.push(body.data.id);
      expect(body.data).toMatchObject({
        categoryId: category.id,
        name,
        slug: slugFrom(name),
      });

      const [images, variants] = await RequestContext.create(orm.em, () =>
        Promise.all([
          productImageService.findAllByProduct(body.data.id),
          productVariantService.findAllByProduct(body.data.id),
        ]),
      );
      expect(images).toHaveLength(1);
      expect(images[0]).toMatchObject({
        url: 'https://example.com/coffee.jpg',
      });
      expect(variants).toHaveLength(1);
      expect(variants[0]).toMatchObject({ sku, name: '250G' });
    });

    it('POST /products responds 409 for a duplicate name', async () => {
      const admin = await createTestUser(UserRole.ADMIN);
      const category = await createTestCategory();
      mockSessionFor(admin.clerkId);
      const name = uniqueName('Duplicate Product E2E');

      const product = await RequestContext.create(orm.em, () =>
        productService.create({ categoryId: category.id, name }),
      );
      createdProductIds.push(product.id);

      await request(app.getHttpServer())
        .post(`${API_BASE_PATH}/products`)
        .send({ categoryId: category.id, name })
        .expect(409);
    });

    it('POST /products responds 404 for a nonexistent category', async () => {
      const admin = await createTestUser(UserRole.ADMIN);
      mockSessionFor(admin.clerkId);

      await request(app.getHttpServer())
        .post(`${API_BASE_PATH}/products`)
        .send({
          categoryId: '00000000-0000-0000-0000-000000000000',
          name: uniqueName('No Category Product E2E'),
        })
        .expect(404);
    });

    it('PATCH /products/:id responds 200 and updates the product', async () => {
      const admin = await createTestUser(UserRole.ADMIN);
      const category = await createTestCategory();
      mockSessionFor(admin.clerkId);
      const product = await RequestContext.create(orm.em, () =>
        productService.create({
          categoryId: category.id,
          name: uniqueName('Kenya AA E2E'),
        }),
      );
      createdProductIds.push(product.id);
      const newName = uniqueName('Kenya AA Renamed E2E');

      const response = await request(app.getHttpServer())
        .patch(`${API_BASE_PATH}/products/${product.id}`)
        .send({ name: newName })
        .expect(200);

      const body = response.body as { data: unknown };
      expect(body.data).toMatchObject({
        name: newName,
        slug: slugFrom(newName),
      });
    });

    it('DELETE /products/:id responds 204 and soft-deletes the product', async () => {
      const admin = await createTestUser(UserRole.ADMIN);
      const category = await createTestCategory();
      mockSessionFor(admin.clerkId);
      const product = await RequestContext.create(orm.em, () =>
        productService.create({
          categoryId: category.id,
          name: uniqueName('Sumatra Mandheling E2E'),
        }),
      );
      createdProductIds.push(product.id);

      await request(app.getHttpServer())
        .delete(`${API_BASE_PATH}/products/${product.id}`)
        .expect(204);

      mockSessionFor(null);
      await request(app.getHttpServer())
        .get(`${API_BASE_PATH}/products/${product.id}`)
        .expect(404);
    });
  });
});
