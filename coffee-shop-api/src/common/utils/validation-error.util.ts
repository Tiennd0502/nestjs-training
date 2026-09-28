import { ValidationError } from 'class-validator';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { ErrorDetail } from '../interfaces/error-response.interface.js';

export function toErrorDetails(
  validationErrors: ValidationError[],
  parentField = '',
): ErrorDetail[] {
  return validationErrors.flatMap((validationError) => {
    const field = parentField
      ? `${parentField}.${validationError.property}`
      : validationError.property;

    const constraintDetails = Object.entries(
      validationError.constraints ?? {},
    ).map(([errCode, message]) => ({
      errCode,
      field,
      message,
      description: message,
    }));

    const childDetails = validationError.children?.length
      ? toErrorDetails(validationError.children, field)
      : [];

    return [...constraintDetails, ...childDetails];
  });
}

/**
 * Maps Standard Schema (e.g. Zod) issues to the same ErrorDetail shape
 * toErrorDetails produces, so a StandardSchemaValidationPipe failure and a
 * class-validator ValidationPipe failure both feed ValidationException.
 * errCode/message follow class-validator's own wording for the string
 * constraints this project's Standard Schema pilot uses (required, min/max
 * length), so a route piloting Standard Schema keeps the same error body
 * shape as every class-validator DTO.
 */
export function toErrorDetailsFromStandardSchemaIssues(
  issues: readonly StandardSchemaV1.Issue[],
): ErrorDetail[] {
  return issues.map((issue) => {
    const field = (issue.path ?? [])
      .map((segment) =>
        typeof segment === 'object' ? String(segment.key) : String(segment),
      )
      .join('.');

    const { errCode, message } = describeStandardSchemaIssue(issue, field);

    return { errCode, field, message, description: message };
  });
}

function describeStandardSchemaIssue(
  issue: StandardSchemaV1.Issue,
  field: string,
): { errCode: string; message: string } {
  const code = (issue as { code?: string }).code;

  if (code === 'invalid_type') {
    if (issue.message.includes('received undefined')) {
      return { errCode: 'isNotEmpty', message: `${field} should not be empty` };
    }
    return { errCode: 'isString', message: `${field} must be a string` };
  }

  if (code === 'too_small') {
    const minimum = (issue as { minimum?: number }).minimum;
    return {
      errCode: 'minLength',
      message: `${field} must be longer than or equal to ${minimum} characters`,
    };
  }

  if (code === 'too_big') {
    const maximum = (issue as { maximum?: number }).maximum;
    return {
      errCode: 'maxLength',
      message: `${field} must be shorter than or equal to ${maximum} characters`,
    };
  }

  return { errCode: code ?? 'invalid', message: issue.message };
}
