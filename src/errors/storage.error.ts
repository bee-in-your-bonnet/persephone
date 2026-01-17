import { PersephoneError } from './base.error';

/**
 * Storage operation error
 */
export class StorageError extends PersephoneError {
  readonly key?: string;
  readonly operation?: string;

  constructor(message: string, key?: string, operation?: string, cause?: unknown) {
    super(
      `Storage error${key ? ` for key "${key}"` : ''}${operation ? ` during ${operation}` : ''}: ${message}`,
      'STORAGE_ERROR',
      cause
    );
    this.key = key;
    this.operation = operation;
  }
}
