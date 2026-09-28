import { ValidationPipe } from '@nestjs/common';
import { toErrorDetails } from '../common/utils/validation-error.util.js';
import { ValidationException } from '../common/exceptions/base.exception.js';

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (validationErrors) =>
      new ValidationException(toErrorDetails(validationErrors)),
  });
}
