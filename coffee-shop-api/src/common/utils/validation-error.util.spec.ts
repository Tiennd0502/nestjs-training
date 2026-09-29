import { ValidationError } from 'class-validator';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import {
  toErrorDetails,
  toErrorDetailsFromStandardSchemaIssues,
} from './validation-error.util.js';
import { createCategorySchema } from '../../modules/category/dto/category.schema.js';
import { paginationQuerySchema } from '../dto/pagination.schema.js';
import { idParamSchema } from '../dto/id-param.schema.js';

describe('toErrorDetails', () => {
  it('maps each constraint of a flat validation error into its own ErrorDetail', () => {
    const errors: ValidationError[] = [
      Object.assign(new ValidationError(), {
        property: 'name',
        constraints: {
          isString: 'name must be a string',
          isNotEmpty: 'name should not be empty',
        },
      }),
    ];

    const result = toErrorDetails(errors);

    expect(result).toEqual([
      {
        errCode: 'isString',
        field: 'name',
        message: 'name must be a string',
        description: 'name must be a string',
      },
      {
        errCode: 'isNotEmpty',
        field: 'name',
        message: 'name should not be empty',
        description: 'name should not be empty',
      },
    ]);
  });

  it('maps multiple top-level errors, each keeping its own field', () => {
    const errors: ValidationError[] = [
      Object.assign(new ValidationError(), {
        property: 'name',
        constraints: { isString: 'name must be a string' },
      }),
      Object.assign(new ValidationError(), {
        property: 'email',
        constraints: { isEmail: 'email must be an email' },
      }),
    ];

    const result = toErrorDetails(errors);

    expect(result).toEqual([
      {
        errCode: 'isString',
        field: 'name',
        message: 'name must be a string',
        description: 'name must be a string',
      },
      {
        errCode: 'isEmail',
        field: 'email',
        message: 'email must be an email',
        description: 'email must be an email',
      },
    ]);
  });

  it('flattens nested children errors with a dotted field path', () => {
    const errors: ValidationError[] = [
      Object.assign(new ValidationError(), {
        property: 'address',
        children: [
          Object.assign(new ValidationError(), {
            property: 'city',
            constraints: { isString: 'city must be a string' },
          }),
        ],
      }),
    ];

    const result = toErrorDetails(errors);

    expect(result).toEqual([
      {
        errCode: 'isString',
        field: 'address.city',
        message: 'city must be a string',
        description: 'city must be a string',
      },
    ]);
  });

  it('returns an empty array for no validation errors', () => {
    expect(toErrorDetails([])).toEqual([]);
  });
});

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

  const run = (schema: StandardSchemaV1, input: unknown) =>
    Promise.resolve(schema['~standard'].validate(input));

  const errorsFor = async (schema: StandardSchemaV1, input: unknown) => {
    const result = await run(schema, input);
    return toErrorDetailsFromStandardSchemaIssues(result.issues ?? []).map(
      ({ errCode, field, message }) => ({ errCode, field, message }),
    );
  };

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
});
