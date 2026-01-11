import type { Validator } from '../types/validation';
import { ValidationError } from '../errors/validation.error';
import { isStandardValidator } from '../types/validation';

export function validate<T>(
  data: unknown,
  validator: Validator<T>,
  key: string
): T {
  if (!isStandardValidator<T>(validator)) {
    throw new ValidationError(
      'Invalid validator: must implement StandardValidator interface',
      key,
      data
    );
  }

  try {
    return validator.parse(data);
  } catch (error) {
    throw new ValidationError(
      error instanceof Error ? error.message : String(error),
      key,
      data,
      error
    );
  }
}

export function safeValidate<T>(
  data: unknown,
  validator: Validator<T>
): { success: boolean; data?: T; error?: unknown } {
  if (!isStandardValidator<T>(validator)) {
    return {
      success: false,
      error: new Error('Invalid validator: must implement StandardValidator interface'),
    };
  }

  return validator.safeParse(data);
}

