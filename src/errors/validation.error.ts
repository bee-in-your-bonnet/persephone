import { PersephoneError } from './base.error';

/**
 * Data validation error
 */
export class ValidationError extends PersephoneError {
  readonly key: string;
  readonly data: unknown;

  constructor(message: string, key: string, data: unknown, cause?: unknown) {
    super(
      `Validation failed for key "${key}": ${message}`,
      'VALIDATION_ERROR',
      cause
    );
    this.key = key;
    this.data = data;
  }
}
