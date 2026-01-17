/**
 * Persephone - Cross-platform key-value storage library
 * 
 * @example
 * ```typescript
 * import { Persephone } from 'persephone';
 * 
 * const db = new Persephone('MyDatabase');
 * db.version(1).schema({
 *   friends: { version: 1, default: [] }
 * });
 * db.useLocalStorage();
 * 
 * await db.set('friends', [{ name: 'Alice', age: 21 }]);
 * const friends = await db.get('friends');
 * ```
 */

// Main class
export { Persephone } from './core/persephone';

// Types
export type {
  IStorage,
  KeyValueStorage,
} from './types/storage';

export type {
  Schema,
  Schemas,
  Migration,
  Reconciliation,
} from './types/schema';

export type {
  Validator,
  StandardValidator,
} from './types/validation';

export type {
  IPersistor,
  IPersistorService,
  Callback,
} from './types/persistor';

// Validation utilities
export { isStandardValidator } from './types/validation';
export { validate, safeValidate } from './utils/validation';

// Errors
export { PersephoneError } from './errors/base.error';
export { MigrationError } from './errors/migration.error';
export { ValidationError } from './errors/validation.error';
export { StorageError } from './errors/storage.error';

// Adapters (for custom implementations)
export { MemoryAdapter } from './adapters/memory/memory.adapter';
export { LocalStorageAdapter } from './adapters/browser/local-storage.adapter';
export { SessionStorageAdapter } from './adapters/browser/session-storage.adapter';
