import { PersephoneError } from './base.error';

export class MigrationError extends PersephoneError {
  readonly key: string;
  readonly fromVersion: number;
  readonly toVersion: number;

  constructor(message: string, key: string, fromVersion: number, toVersion: number, cause?: unknown) {
    super(
      `migration failed for key "${key}" from version ${fromVersion} to ${toVersion}: ${message}`,
      'MIGRATION_ERROR',
      cause
    );
    this.key = key;
    this.fromVersion = fromVersion;
    this.toVersion = toVersion;
  }
}

