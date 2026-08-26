import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { CategoryService } from './../src/modules/category/services/category.service';

describe('GlobalExceptionFilter (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CategoryService)
      .useValue({
        findAll: () => {
          throw new Error('unexpected database failure');
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responds 500 with the consistent error envelope when a route throws a non-HttpException error', async () => {
    const response = await request(app.getHttpServer())
      .get('/categories')
      .expect(500);

    const body = response.body as {
      statusCode: number;
      message: string;
      errors: unknown[];
    };
    expect(body.statusCode).toBe(500);
    expect(typeof body.message).toBe('string');
    expect(body.errors.length).toBeGreaterThan(0);
    expect(JSON.stringify(response.body)).not.toContain(
      'unexpected database failure',
    );
  });
});
