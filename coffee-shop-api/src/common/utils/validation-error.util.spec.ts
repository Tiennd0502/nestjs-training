import type { StandardSchemaV1 } from '@standard-schema/spec';
import { toErrorDetailsFromStandardSchemaIssues } from './validation-error.util.js';
import { createCategorySchema } from '../../modules/category/dto/category.schema.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../../modules/product/dto/product.schema.js';
import { RoastLevel } from '../../modules/product/enums/product.enum.js';
import { ProductUnit } from '../../modules/product-variant/enums/product-variant.enum.js';
import { paginationQuerySchema } from '../dto/pagination.schema.js';
import { idParamSchema } from '../dto/id-param.schema.js';
import { createUserSchema } from '../../modules/user/dto/user.schema.js';

describe('toErrorDetailsFromStandardSchemaIssues (Standard Schema pilot: createCategorySchema)', () => {
  const validate = async (input: unknown) =>
    createCategorySchema['~standard'].validate(input);

  it('has no issues for a valid name', async () => {
    const result = await validate({ name: 'Espresso' });

    expect(result.issues).toBeUndefined();
  });

  it('matches the baseline minLength body for a too-short name', async () => {
    const result = await validate({ name: 'a' });

    expect(toErrorDetailsFromStandardSchemaIssues(result.issues ?? [])).toEqual(
      [
        {
          errCode: 'minLength',
          field: 'name',
          message: 'Name must be longer than or equal to 2 characters',
          description: 'Name must be longer than or equal to 2 characters',
        },
      ],
    );
  });

  it('maps a missing name to isNotEmpty', async () => {
    const result = await validate({});

    expect(toErrorDetailsFromStandardSchemaIssues(result.issues ?? [])).toEqual(
      [
        {
          errCode: 'isNotEmpty',
          field: 'name',
          message: 'Name should not be empty',
          description: 'Name should not be empty',
        },
      ],
    );
  });

  it('maps a non-string name to isString', async () => {
    const result = await validate({ name: 123 });

    expect(toErrorDetailsFromStandardSchemaIssues(result.issues ?? [])).toEqual(
      [
        {
          errCode: 'isString',
          field: 'name',
          message: 'Name must be a string',
          description: 'Name must be a string',
        },
      ],
    );
  });
});

describe('toErrorDetailsFromStandardSchemaIssues (migrated schemas)', () => {
  const uuid = '11111111-1111-4111-8111-111111111111';
  const unit = Object.values(ProductUnit)[0];
  const validVariant = { sku: 'S1', weight: 1, unit, price: 2 };
  const validProduct = {
    categoryId: uuid,
    name: 'Espresso',
    variants: [validVariant],
  };
  const roastLevels = Object.values(RoastLevel).join(', ');

  const run = (schema: StandardSchemaV1, input: unknown) =>
    Promise.resolve(schema['~standard'].validate(input));

  const errorsFor = async (schema: StandardSchemaV1, input: unknown) => {
    const result = await run(schema, input);
    return toErrorDetailsFromStandardSchemaIssues(result.issues ?? []).map(
      ({ errCode, field, message }) => ({ errCode, field, message }),
    );
  };

  describe('createProductSchema', () => {
    it('accepts a valid product and hands variants over with string decimals', async () => {
      const result = await run(createProductSchema, {
        ...validProduct,
        variants: [{ ...validVariant, weight: 1.5, discountValue: '2' }],
      });

      expect(result.issues).toBeUndefined();
      expect(
        (result as { value: { variants: unknown[] } }).value.variants,
      ).toEqual([
        { ...validVariant, weight: '1.5', price: '2', discountValue: '2' },
      ]);
    });

    it('accepts null for the nullable text columns', async () => {
      const result = await run(createProductSchema, {
        ...validProduct,
        description: null,
        roastLevel: null,
        tastingNotes: null,
        origin: null,
        processingMethod: null,
      });

      expect(result.issues).toBeUndefined();
    });

    it.each([
      [
        'a malformed categoryId',
        { ...validProduct, categoryId: 'x' },
        {
          errCode: 'isUuid',
          field: 'categoryId',
          message: 'CategoryId must be a UUID',
        },
      ],
      [
        'a UUID-shaped categoryId with an invalid version',
        { ...validProduct, categoryId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
        {
          errCode: 'isUuid',
          field: 'categoryId',
          message: 'CategoryId must be a UUID',
        },
      ],
      [
        'an unknown roastLevel',
        { ...validProduct, roastLevel: 'BURNT' },
        {
          errCode: 'isEnum',
          field: 'roastLevel',
          message: `RoastLevel must be one of the following values: ${roastLevels}`,
        },
      ],
      [
        'a non-boolean flag',
        { ...validProduct, isOrganic: 'yes' },
        {
          errCode: 'isBoolean',
          field: 'isOrganic',
          message: 'IsOrganic must be a boolean value',
        },
      ],
      [
        'images that are not an array',
        { ...validProduct, images: 'x' },
        {
          errCode: 'isArray',
          field: 'images',
          message: 'Images must be an array',
        },
      ],
      [
        'more than six images',
        {
          ...validProduct,
          images: Array(7).fill({ url: 'https://example.com/a.png' }),
        },
        {
          errCode: 'arrayMaxSize',
          field: 'images',
          message: 'Images must contain no more than 6 elements',
        },
      ],
      [
        'an image with a bad url',
        { ...validProduct, images: [{ url: 'nope' }] },
        {
          errCode: 'isUrl',
          field: 'images.0.url',
          message: 'Url must be a URL address',
        },
      ],
      [
        'a negative image sortOrder',
        {
          ...validProduct,
          images: [{ url: 'https://example.com/a.png', sortOrder: -1 }],
        },
        {
          errCode: 'min',
          field: 'images.0.sortOrder',
          message: 'SortOrder must not be less than 0',
        },
      ],
      [
        'a zero variant weight',
        { ...validProduct, variants: [{ ...validVariant, weight: 0 }] },
        {
          errCode: 'isPositive',
          field: 'variants.0.weight',
          message: 'Weight must be a positive number',
        },
      ],
      [
        'a non-numeric variant price',
        { ...validProduct, variants: [{ ...validVariant, price: 'abc' }] },
        {
          errCode: 'isNumber',
          field: 'variants.0.price',
          message:
            'Price must be a number conforming to the specified constraints',
        },
      ],
      [
        'an unknown variant unit',
        { ...validProduct, variants: [{ ...validVariant, unit: 'XX' }] },
        {
          errCode: 'isEnum',
          field: 'variants.0.unit',
          message: `Unit must be one of the following values: ${Object.values(ProductUnit).join(', ')}`,
        },
      ],
      [
        'a name over the max length',
        { ...validProduct, name: 'a'.repeat(101) },
        {
          errCode: 'maxLength',
          field: 'name',
          message: 'Name must be shorter than or equal to 100 characters',
        },
      ],
    ])('maps %s', async (_name, input, expected) => {
      expect(await errorsFor(createProductSchema, input)).toEqual([expected]);
    });
  });

  describe('updateProductSchema', () => {
    it('accepts an empty body and null to clear a nullable column', async () => {
      expect((await run(updateProductSchema, {})).issues).toBeUndefined();
      expect(
        (await run(updateProductSchema, { description: null })).issues,
      ).toBeUndefined();
    });

    it('accepts the image change lists', async () => {
      const result = await run(updateProductSchema, {
        removeImageIds: [uuid],
        updateImages: [{ id: uuid, isPrimary: true }],
        addImages: [{ url: 'https://example.com/a.png' }],
      });

      expect(result.issues).toBeUndefined();
    });

    it.each([
      [
        'a removed image id that is not a UUID',
        { removeImageIds: ['x'] },
        {
          errCode: 'isUuid',
          field: 'removeImageIds.0',
          message: 'RemoveImageIds must be a UUID',
        },
      ],
      [
        'an image patch without an id',
        { updateImages: [{ isPrimary: true }] },
        {
          errCode: 'isNotEmpty',
          field: 'updateImages.0.id',
          message: 'Id should not be empty',
        },
      ],
      [
        'an added image with a bad url',
        { addImages: [{ url: 'nope' }] },
        {
          errCode: 'isUrl',
          field: 'addImages.0.url',
          message: 'Url must be a URL address',
        },
      ],
    ])('maps %s', async (_name, input, expected) => {
      expect(await errorsFor(updateProductSchema, input)).toEqual([expected]);
    });

    it('drops images and variants, which are only accepted on create', async () => {
      const result = await run(updateProductSchema, {
        name: 'Renamed',
        images: [{ url: 'nope' }],
      });

      expect((result as { value: object }).value).toEqual({ name: 'Renamed' });
    });
  });

  describe('productQuerySchema', () => {
    it('splits a comma-separated roastLevel into an array', async () => {
      const result = await run(productQuerySchema, {
        roastLevel: 'LIGHT,DARK',
      });

      expect(
        (result as { value: { roastLevel: string[] } }).value.roastLevel,
      ).toEqual(['LIGHT', 'DARK']);
    });

    it('reports an unknown roastLevel value on the roastLevel field', async () => {
      expect(
        await errorsFor(productQuerySchema, { roastLevel: 'BURNT' }),
      ).toEqual([
        {
          errCode: 'isEnum',
          field: 'roastLevel.0',
          message: `RoastLevel must be one of the following values: ${roastLevels}`,
        },
      ]);
    });

    it('maps a negative minPrice to min', async () => {
      expect(await errorsFor(productQuerySchema, { minPrice: '-1' })).toEqual([
        {
          errCode: 'min',
          field: 'minPrice',
          message: 'MinPrice must not be less than 0',
        },
      ]);
    });
  });

  describe('paginationQuerySchema', () => {
    it.each([
      [
        'page below the minimum',
        { page: '0' },
        'min',
        'page',
        'Page must not be less than 1',
      ],
      [
        'limit above the maximum',
        { limit: '101' },
        'max',
        'limit',
        'Limit must not be greater than 100',
      ],
      [
        'fractional page',
        { page: '1.5' },
        'isInt',
        'page',
        'Page must be an integer number',
      ],
      [
        'non-numeric limit',
        { limit: 'abc' },
        'isNumber',
        'limit',
        'Limit must be a number conforming to the specified constraints',
      ],
    ])('maps a %s', async (_name, input, errCode, field, message) => {
      expect(await errorsFor(paginationQuerySchema, input)).toEqual([
        { errCode, field, message },
      ]);
    });
  });

  describe('idParamSchema', () => {
    it('accepts a UUID', async () => {
      expect((await run(idParamSchema, { id: uuid })).issues).toBeUndefined();
    });

    it('reports a malformed id on the id field', async () => {
      expect(await errorsFor(idParamSchema, { id: 'abc' })).toEqual([
        { errCode: 'isUuid', field: 'id', message: 'Id must be a UUID' },
      ]);
    });
  });

  describe('createUserSchema', () => {
    it('falls back to the raw Zod code for a format with no dedicated mapping', async () => {
      expect(
        await errorsFor(createUserSchema, {
          clerkId: 'clerk-1',
          email: 'not-an-email',
          firstName: 'Baseline',
          lastName: 'User',
        }),
      ).toEqual([
        {
          errCode: 'invalid_format',
          field: 'email',
          message: 'Invalid email address',
        },
      ]);
    });
  });
});

// None of this project's Zod schemas produce these shapes — Zod always sets `code`
// and a plain string/number `path`. These cover the parts of the mapper that exist
// only to satisfy the wider Standard Schema spec (object-shaped path segments, no
// `path`, no `code`), using issue literals instead of a real schema failure.
describe('toErrorDetailsFromStandardSchemaIssues (spec-compliance edge cases)', () => {
  it('reads the key off an object-shaped path segment', () => {
    const issues: StandardSchemaV1.Issue[] = [
      { code: 'custom', path: [{ key: 'name' }], message: 'Bad name' } as never,
    ];

    expect(toErrorDetailsFromStandardSchemaIssues(issues)).toEqual([
      {
        errCode: 'custom',
        field: 'name',
        message: 'Bad name',
        description: 'Bad name',
      },
    ]);
  });

  it('defaults the field to an empty string when the issue has no path', () => {
    const issues: StandardSchemaV1.Issue[] = [
      { message: 'Root-level failure' },
    ];

    expect(toErrorDetailsFromStandardSchemaIssues(issues)).toEqual([
      {
        errCode: 'invalid',
        field: '',
        message: 'Root-level failure',
        description: 'Root-level failure',
      },
    ]);
  });

  it('falls back to the joined path when every segment is an array index', () => {
    const issues: StandardSchemaV1.Issue[] = [
      { code: 'custom', path: [0], message: 'Bad root item' } as never,
    ];

    expect(toErrorDetailsFromStandardSchemaIssues(issues)).toEqual([
      {
        errCode: 'custom',
        field: '0',
        message: 'Bad root item',
        description: 'Bad root item',
      },
    ]);
  });
});
