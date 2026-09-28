import { StandardSchemaValidationPipe, ValidationPipe } from '@nestjs/common';
import {
  toErrorDetails,
  toErrorDetailsFromStandardSchemaIssues,
} from '../common/utils/validation-error.util.js';
import { ValidationException } from '../common/exceptions/base.exception.js';

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (validationErrors) =>
      new ValidationException(toErrorDetails(validationErrors)),
  });
}

export function createStandardSchemaValidationPipe(): StandardSchemaValidationPipe {
  return new StandardSchemaValidationPipe({
    exceptionFactory: (issues) =>
      new ValidationException(toErrorDetailsFromStandardSchemaIssues(issues)),
  });
}
