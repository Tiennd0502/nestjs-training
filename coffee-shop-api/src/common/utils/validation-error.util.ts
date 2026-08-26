import { ValidationError } from 'class-validator';
import { ErrorDetail } from '../interfaces/error-response.interface';

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
