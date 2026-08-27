import {
  ArgumentsHost,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { ErrorDetail } from '../interfaces/error-response.interface';
import { DomainException } from '../exceptions/base.exception';

class TestDomainException extends DomainException {
  constructor(status: HttpStatus, message: string, errors: ErrorDetail[]) {
    super(status, message, errors);
  }
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status: statusMock }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('preserves status, message and full structured errors for a DomainException', () => {
    const exception = new TestDomainException(
      HttpStatus.NOT_FOUND,
      'Category not found',
      [
        {
          errCode: 'CATEGORY_NOT_FOUND',
          field: 'id',
          message: 'Category not found',
          description: 'No category exists with the given id',
        },
      ],
    );

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Category not found',
      errors: [
        {
          errCode: 'CATEGORY_NOT_FOUND',
          field: 'id',
          message: 'Category not found',
          description: 'No category exists with the given id',
        },
      ],
    });
  });

  it('maps a built-in HttpException to a default status-based message and a single generic error entry', () => {
    const exception = new NotFoundException('User not found');

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Item not found',
      errors: [
        {
          errCode: 'itemNotFound',
          field: '',
          message: 'User not found',
          description: 'User not found',
        },
      ],
    });
  });

  it('returns 500 with a system error entry for a non-HttpException, without leaking internals', () => {
    const exception = new Error('secret db connection string exposed');

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'System error',
      errors: [
        {
          errCode: 'internalServerError',
          field: '',
          message: 'An unexpected error occurred. Please try again later.',
          description: 'An unexpected error occurred. Please try again later.',
        },
      ],
    });
    const [body] = jsonMock.mock.calls[0] as [Record<string, unknown>];
    expect(JSON.stringify(body)).not.toContain(
      'secret db connection string exposed',
    );
  });

  it('logs the original error message and stack for a non-HttpException', () => {
    const errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const exception = new Error('boom');

    filter.catch(exception, host);

    expect(errorSpy).toHaveBeenCalledWith('boom', exception.stack);

    errorSpy.mockRestore();
  });
});
