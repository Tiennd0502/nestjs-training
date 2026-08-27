import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import request from 'supertest';
import { App } from 'supertest/types';
import { getAuth } from '@clerk/express';
import { AppModule } from './../../src/app.module';
import { UserService } from './../../src/modules/user/services/user.service';
import { UserRole, UserStatus } from './../../src/common/enums/user.enum';
import { API_BASE_PATH } from './../utils/api-path.util';
import { initTestApp } from './../utils/init-test-app.util';
import type { User } from './../../src/modules/user/entities/user.entity';

jest.mock('@clerk/express', () => {
  const actual: object = jest.requireActual('@clerk/express');
  return { ...actual, getAuth: jest.fn() };
});

describe('UserController auth (e2e)', () => {
  let app: INestApplication<App>;
  let orm: MikroORM;
  let userService: UserService;
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await initTestApp(moduleFixture);

    orm = app.get(MikroORM);
    userService = app.get(UserService);
  });

  afterAll(async () => {
    await RequestContext.create(orm.em, async () => {
      for (const id of createdUserIds) {
        await userService.softDelete(id).catch(() => undefined);
      }
    });
    await app.close();
  });

  beforeEach(() => {
    (getAuth as jest.Mock).mockReturnValue({ userId: null });
  });

  const createTestUser = async (
    overrides: { role?: UserRole; status?: UserStatus } = {},
  ): Promise<User> =>
    RequestContext.create(orm.em, async () => {
      const clerkId = `clerk-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      let user = await userService.create({
        clerkId,
        email: `${clerkId}@example.com`,
        firstName: 'E2E',
        lastName: 'Test',
        role: overrides.role,
      });
      createdUserIds.push(user.id);

      if (
        overrides.status &&
        overrides.status !== (user.status as UserStatus)
      ) {
        user = await userService.update(user.id, { status: overrides.status });
      }

      return user;
    });

  const mockSessionFor = (clerkId: string | null): void => {
    (getAuth as jest.Mock).mockReturnValue({ userId: clerkId });
  };

  describe('no Clerk session', () => {
    it.each([
      ['get', `${API_BASE_PATH}/users`],
      ['get', `${API_BASE_PATH}/users/some-id`],
      ['post', `${API_BASE_PATH}/users`],
      ['patch', `${API_BASE_PATH}/users/some-id`],
      ['delete', `${API_BASE_PATH}/users/some-id`],
      ['get', `${API_BASE_PATH}/users/me`],
    ])('%s %s responds 401', async (method, path) => {
      await (
        request(app.getHttpServer()) as unknown as Record<
          string,
          (path: string) => request.Test
        >
      )
        [method](path)
        .expect(401);
    });
  });

  describe('Clerk session with no matching local user', () => {
    it('GET /users responds 401', async () => {
      mockSessionFor('clerk-id-that-does-not-exist');

      await request(app.getHttpServer())
        .get(`${API_BASE_PATH}/users`)
        .expect(401);
    });
  });

  describe('authenticated but INACTIVE local user', () => {
    it('GET /users responds 403', async () => {
      const user = await createTestUser({
        role: UserRole.ADMIN,
        status: UserStatus.INACTIVE,
      });
      mockSessionFor(user.clerkId);

      await request(app.getHttpServer())
        .get(`${API_BASE_PATH}/users`)
        .expect(403);
    });

    it('GET /me responds 403', async () => {
      const user = await createTestUser({ status: UserStatus.INACTIVE });
      mockSessionFor(user.clerkId);

      await request(app.getHttpServer())
        .get(`${API_BASE_PATH}/users/me`)
        .expect(403);
    });
  });

  describe('authenticated ACTIVE non-ADMIN local user', () => {
    it('GET /users responds 403', async () => {
      const user = await createTestUser({ role: UserRole.USER });
      mockSessionFor(user.clerkId);

      await request(app.getHttpServer())
        .get(`${API_BASE_PATH}/users`)
        .expect(403);
    });

    it('GET /me responds 200 with the caller own profile', async () => {
      const user = await createTestUser({ role: UserRole.USER });
      mockSessionFor(user.clerkId);

      const response = await request(app.getHttpServer())
        .get(`${API_BASE_PATH}/users/me`)
        .expect(200);

      expect(response.body).toEqual({
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          avatarUrl: user.avatarUrl,
        },
      });
    });
  });

  describe('authenticated ACTIVE ADMIN local user', () => {
    it('GET /users responds 200 with the paginated envelope', async () => {
      const user = await createTestUser({ role: UserRole.ADMIN });
      mockSessionFor(user.clerkId);

      const response = await request(app.getHttpServer())
        .get(`${API_BASE_PATH}/users`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });
  });
});
