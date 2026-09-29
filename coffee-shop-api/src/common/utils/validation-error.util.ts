import type { StandardSchemaV1 } from '@standard-schema/spec';
import { ErrorDetailDto } from '../dto/error.dto.js';

/**
 * Maps Standard Schema (e.g. Zod) issues to ErrorDetailDto, the shape a
 * StandardSchemaValidationPipe failure is returned in through
 * ValidationException. `errCode` is the API's error code for the failed
 * constraint (minLength, isUuid, ...) and `field` is the dotted path to the
 * value, so a nested failure reads `variants.0.weight`.
 */
export const toErrorDetailsFromStandardSchemaIssues = (
  issues: readonly StandardSchemaV1.Issue[],
): ErrorDetailDto[] => {
  return issues.map((issue) => {
    const segments = (issue.path ?? []).map((segment) =>
      typeof segment === 'object' ? String(segment.key) : String(segment),
    );
    const field = segments.join('.');
    // The message names the property, not the whole path.
    const property = segments.filter((s) => !isIndex(s)).at(-1) ?? field;

    const { errCode, message } = describeStandardSchemaIssue(issue, property);

    return { errCode, field, message, description: message };
  });
};

const isIndex = (segment: string): boolean => /^\d+$/.test(segment);

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const describeStandardSchemaIssue = (
  issue: StandardSchemaV1.Issue,
  subject: string,
): { errCode: string; message: string } => {
  const {
    code,
    expected,
    origin,
    format,
    minimum,
    maximum,
    inclusive,
    values,
  } = issue as {
    code?: string;
    expected?: string;
    origin?: string;
    format?: string;
    minimum?: number;
    maximum?: number;
    inclusive?: boolean;
    values?: unknown[];
  };
  const label = capitalize(subject);
  const isNumeric = origin === 'number' || origin === 'int';

  if (code === 'invalid_type') {
    if (issue.message.includes('received undefined')) {
      return { errCode: 'isNotEmpty', message: `${label} should not be empty` };
    }
    if (expected === 'int') {
      return {
        errCode: 'isInt',
        message: `${label} must be an integer number`,
      };
    }
    if (expected === 'number') {
      return {
        errCode: 'isNumber',
        message: `${label} must be a number conforming to the specified constraints`,
      };
    }
    if (expected === 'boolean') {
      return {
        errCode: 'isBoolean',
        message: `${label} must be a boolean value`,
      };
    }
    if (expected === 'array') {
      return { errCode: 'isArray', message: `${label} must be an array` };
    }
    return { errCode: 'isString', message: `${label} must be a string` };
  }

  if (code === 'too_small') {
    if (isNumeric && inclusive === false && minimum === 0) {
      return {
        errCode: 'isPositive',
        message: `${label} must be a positive number`,
      };
    }
    if (isNumeric) {
      return {
        errCode: 'min',
        message: `${label} must not be less than ${minimum}`,
      };
    }
    return {
      errCode: 'minLength',
      message: `${label} must be longer than or equal to ${minimum} characters`,
    };
  }

  if (code === 'too_big') {
    if (isNumeric) {
      return {
        errCode: 'max',
        message: `${label} must not be greater than ${maximum}`,
      };
    }
    if (origin === 'array') {
      return {
        errCode: 'arrayMaxSize',
        message: `${label} must contain no more than ${maximum} elements`,
      };
    }
    return {
      errCode: 'maxLength',
      message: `${label} must be shorter than or equal to ${maximum} characters`,
    };
  }

  if (code === 'invalid_format') {
    if (format === 'uuid') {
      return { errCode: 'isUuid', message: `${label} must be a UUID` };
    }
    if (format === 'url') {
      return { errCode: 'isUrl', message: `${label} must be a URL address` };
    }
  }

  if (code === 'invalid_value' && values) {
    return {
      errCode: 'isEnum',
      message: `${label} must be one of the following values: ${values.join(', ')}`,
    };
  }

  return { errCode: code ?? 'invalid', message: issue.message };
};
