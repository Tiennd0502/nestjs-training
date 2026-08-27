import { ValidationError } from 'class-validator';
import { toErrorDetails } from './validation-error.util';

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
