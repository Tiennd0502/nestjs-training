import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorDetail } from '../interfaces/error-response.interface';
import { ERROR_MESSAGES } from '../constants/message.constant';

export abstract class DomainException extends HttpException {
  private readonly errors: ErrorDetail[];

  protected constructor(
    status: number,
    message: string,
    errors: ErrorDetail[],
  ) {
    super(message, status);
    this.errors = errors;
  }

  getErrors(): ErrorDetail[] {
    return this.errors;
  }
}

export abstract class SingleErrorDomainException extends DomainException {
  protected constructor(
    status: HttpStatus,
    topLevelMessage: string,
    error: ErrorDetail,
  ) {
    super(status, topLevelMessage, [error]);
  }
}

export class ValidationException extends DomainException {
  constructor(errors: ErrorDetail[]) {
    super(
      HttpStatus.BAD_REQUEST,
      ERROR_MESSAGES.EXCEPTION.VALIDATION_FAILED,
      errors,
    );
  }
}

export class InvalidRequestException extends SingleErrorDomainException {
  constructor(error: ErrorDetail) {
    super(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.EXCEPTION.BAD_REQUEST, error);
  }
}

export class ItemNotFoundException extends SingleErrorDomainException {
  constructor(error: ErrorDetail) {
    super(HttpStatus.NOT_FOUND, ERROR_MESSAGES.EXCEPTION.ITEM_NOT_FOUND, error);
  }
}

export class DuplicateResourceException extends SingleErrorDomainException {
  constructor(error: ErrorDetail) {
    super(HttpStatus.CONFLICT, ERROR_MESSAGES.EXCEPTION.CONFLICT, error);
  }
}
