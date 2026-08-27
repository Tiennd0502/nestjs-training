import { HttpStatus } from '@nestjs/common';
import {
  DomainException,
  ValidationException,
  InvalidRequestException,
  ItemNotFoundException,
  DuplicateResourceException,
} from './base.exception';
import { ErrorDetail } from '../interfaces/error-response.interface';

class TestDomainException extends DomainException {
  constructor(status: number, message: string, errors: ErrorDetail[]) {
    super(status, message, errors);
  }
}

describe('DomainException', () => {
  it('exposes the status and message via HttpException accessors', () => {
    const errors: ErrorDetail[] = [
      {
        errCode: 'TEST_ERROR',
        field: 'name',
        message: 'Name is invalid',
        description: 'The name field failed validation',
      },
    ];

    const exception = new TestDomainException(
      HttpStatus.BAD_REQUEST,
      'Invalid request',
      errors,
    );

    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.message).toBe('Invalid request');
  });

  it('exposes all structured error entries in order via getErrors()', () => {
    const errors: ErrorDetail[] = [
      {
        errCode: 'ERR_1',
        field: 'name',
        message: 'Name is invalid',
        description: 'desc 1',
      },
      {
        errCode: 'ERR_2',
        field: 'email',
        message: 'Email is invalid',
        description: 'desc 2',
      },
    ];

    const exception = new TestDomainException(
      HttpStatus.BAD_REQUEST,
      'Invalid request',
      errors,
    );

    expect(exception.getErrors()).toEqual(errors);
  });
});

describe('ValidationException', () => {
  it('resolves to 400 with a fixed top-level message and the given structured errors', () => {
    const errors = [
      {
        errCode: 'isString',
        field: 'name',
        message: 'name must be a string',
        description: 'name must be a string',
      },
    ];

    const exception = new ValidationException(errors);

    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.message).toBe('Validation failed');
    expect(exception.getErrors()).toEqual(errors);
  });
});

describe('InvalidRequestException', () => {
  it('resolves to 400 with a generic top-level message and the given structured error', () => {
    const error = {
      errCode: 'invalidRequest',
      field: 'username',
      message: 'User name cannot be blank',
      description: 'Please enter your name',
    };

    const exception = new InvalidRequestException(error);

    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.message).toBe('Bad request');
    expect(exception.getErrors()).toEqual([error]);
  });
});

describe('ItemNotFoundException', () => {
  it('resolves to 404 with a generic top-level message and the given structured error', () => {
    const error = {
      errCode: 'itemNotFound',
      field: 'id',
      message: 'Resource not found with the provided ID',
      description:
        'The category might have been deleted, or the link is broken.',
    };

    const exception = new ItemNotFoundException(error);

    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(exception.message).toBe('Item not found');
    expect(exception.getErrors()).toEqual([error]);
  });
});

describe('DuplicateResourceException', () => {
  it('resolves to 409 with a generic top-level message and the given structured error', () => {
    const error = {
      errCode: 'categoryNameExists',
      field: 'name',
      message: 'Category name already exists',
      description:
        'A category with this name already exists. Please choose a different name.',
    };

    const exception = new DuplicateResourceException(error);

    expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(exception.message).toBe('Conflict');
    expect(exception.getErrors()).toEqual([error]);
  });
});
