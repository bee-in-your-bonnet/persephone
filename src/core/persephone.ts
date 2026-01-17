import type { IStorage } from '../types/storage';
import type { Schemas, Schema } from '../types/schema';
import { VersionBuilder } from './version-builder';
import { MemoryAdapter } from '../adapters/memory/memory.adapter';
import { LocalStorageAdapter } from '../adapters/browser/local-storage.adapter';
import { SessionStorageAdapter } from '../adapters/browser/session-storage.adapter';
import { deserialize, serialize } from '../utils/serialization';
import { validate } from '../utils/validation';
import { setStoredVersion } from '../utils/migrations';
import { initializeKey } from '../utils/migrations';

/**
 * Main Persephone class - public API (similar to Dexie)
 * 
 * Provides a cross-platform key-value storage abstraction with:
 * - Versioning and migrations
 * - Schema validation (supports standard schemas like Zod)
 * - Multiple storage adapters (localStorage, sessionStorage, memory, etc.)
 * - Callback and Promise support
 */
export class Persephone {
  private _name: string;
  private _adapter: IStorage | null = null;
  private _schemas: Schemas = {};
  private _version: number = 1;
  private _initialized: boolean = false;

  constructor(name: string) {
    this._name = name;
  }

  /**
   * Get database name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Get current storage adapter
   */
  get adapter(): IStorage | null {
    return this._adapter;
  }

  /**
   * Get all schemas
   */
  get schemas(): Schemas {
    return this._schemas;
  }

  /**
   * Get current database version
   */
  get currentVersion(): number {
    return this._version;
  }

  /**
   * Set database version and return VersionBuilder for chaining
   * 
   * @example
   * ```typescript
   * db.version(1).schema({ ... });
   * ```
   */
  version(version: number): VersionBuilder {
    this._version = version;
    return new VersionBuilder(this, version);
  }

  /**
   * Internal method to set schemas (used by VersionBuilder)
   */
  _setSchemas(schemas: Schemas): void {
    this._schemas = schemas;
  }

  /**
   * Initialize database (execute migrations)
   * Must be called after setting adapter and schemas
   * 
   * @example
   * ```typescript
   * const db = new Persephone('MyDB');
   * db.version(1).schema({ ... });
   * db.useMemory();
   * await db.open(); // Executes migrations
   * ```
   */
  async open(): Promise<void> {
    if (!this._adapter) {
      throw new Error('Adapter is not set. Call useMemory(), useLocalStorage() or use() first.');
    }

    if (Object.keys(this._schemas).length === 0) {
      throw new Error('Schemas are not set. Call version().schema() first.');
    }

    // Execute migrations for all keys with schemas
    for (const [key, schema] of Object.entries(this._schemas)) {
      await initializeKey(this._adapter, key, schema as Schema<unknown>);
    }

    this._initialized = true;
  }

  /**
   * Check if database is initialized
   */
  get isOpen(): boolean {
    return this._initialized;
  }

  useLocalStorage(): this {
    this._adapter = new LocalStorageAdapter();
    return this;
  }

  useSessionStorage(): this {
    this._adapter = new SessionStorageAdapter();
    return this;
  }

  /**
   * Use in-memory adapter (for testing or fallback)
   */
  useMemory(): this {
    this._adapter = new MemoryAdapter();
    return this;
  }

  /**
   * Use custom storage adapter
   * 
   * @param adapter - Custom IStorage implementation
   */
  use(adapter: IStorage): this {
    this._adapter = adapter;
    return this;
  }

  /**
   * Get value by key
   * Supports both Promise and callback patterns
   * 
   * @param key - Storage key
   * @param callback - Optional callback (if provided, Promise is not returned)
   * @returns Promise with value or null, or void if callback is provided
   */
  get<T>(key: string): Promise<T | null>;
  get<T>(key: string, callback: (err: Error | null, value: T | null) => void): void;
  get<T>(key: string, callback?: (err: Error | null, value: T | null) => void): Promise<T | null> | void {
    if (!this._adapter) {
      const error = new Error('Adapter is not set');
      if (callback) {
        callback(error, null);
        return;
      }
      return Promise.reject(error);
    }

    if (!this._initialized) {
      const error = new Error('Database is not initialized. Call open() first.');
      if (callback) {
        callback(error, null);
        return;
      }
      return Promise.reject(error);
    }

    const schema = this._schemas[key] as Schema<T> | undefined;
    if (!schema) {
      const error = new Error(`Schema for key "${key}" is not defined`);
      if (callback) {
        callback(error, null);
        return;
      }
      return Promise.reject(error);
    }

    const promise = (async (): Promise<T | null> => {
      // Data is already migrated in open(), just get and validate
      const rawData = await this._adapter!.getItem(key);
      
      if (!rawData) {
        return schema.default;
      }

      const data = deserialize<T>(rawData, schema);

      // Validate if validator is provided
      if (schema.validator) {
        return validate<T>(data, schema.validator, key);
      }

      return data;
    })();

    if (callback) {
      promise
        .then((value) => callback(null, value))
        .catch((err) => callback(err instanceof Error ? err : new Error(String(err)), null));
      return;
    }

    return promise;
  }

  /**
   * Set value by key
   * Supports both Promise and callback patterns
   * 
   * @param key - Storage key
   * @param value - Value to store
   * @param callback - Optional callback (if provided, Promise is not returned)
   * @returns Promise or void if callback is provided
   */
  set<T>(key: string, value: T): Promise<void>;
  set<T>(key: string, value: T, callback: (err: Error | null) => void): void;
  set<T>(key: string, value: T, callback?: (err: Error | null) => void): Promise<void> | void {
    if (!this._adapter) {
      const error = new Error('Adapter is not set');
      if (callback) {
        callback(error);
        return;
      }
      return Promise.reject(error);
    }

    if (!this._initialized) {
      const error = new Error('Database is not initialized. Call open() first.');
      if (callback) {
        callback(error);
        return;
      }
      return Promise.reject(error);
    }

    const schema = this._schemas[key] as Schema<T> | undefined;
    if (!schema) {
      const error = new Error(`Schema for key "${key}" is not defined`);
      if (callback) {
        callback(error);
        return;
      }
      return Promise.reject(error);
    }

    const promise = (async (): Promise<void> => {
      // Validate if validator is provided
      let validatedValue: T = value;
      if (schema.validator) {
        validatedValue = validate<T>(value, schema.validator, key);
      }

      // Serialize
      const serialized = serialize(validatedValue, schema);

      // Save to storage
      await this._adapter!.setItem(key, serialized);

      // Update version (in case schema changed)
      await setStoredVersion(this._adapter!, key, schema.version);
    })();

    if (callback) {
      promise
        .then(() => callback(null))
        .catch((err) => callback(err instanceof Error ? err : new Error(String(err))));
      return;
    }

    return promise;
  }

  /**
   * Remove value by key
   * 
   * @todo Implement remove method
   */
  remove(_key: string): Promise<void>;
  remove(_key: string, _callback: (err: Error | null) => void): void;
  remove(_key: string, _callback?: (err: Error | null) => void): Promise<void> | void {
    throw new Error('Not implemented yet');
  }

  /**
   * Clear all values
   * 
   * @todo Implement clear method
   */
  clear(): Promise<void>;
  clear(_callback: (err: Error | null) => void): void;
  clear(_callback?: (err: Error | null) => void): Promise<void> | void {
    throw new Error('Not implemented yet');
  }

  /**
   * Get all keys
   * 
   * @todo Implement keys method
   */
  keys(): Promise<string[]>;
  keys(_callback: (err: Error | null, keys: string[]) => void): void;
  keys(_callback?: (err: Error | null, keys: string[]) => void): Promise<string[]> | void {
    throw new Error('Not implemented yet');
  }

  /**
   * Get number of stored items
   * 
   * @todo Implement length method
   */
  length(): Promise<number>;
  length(_callback: (err: Error | null, length: number) => void): void;
  length(_callback?: (err: Error | null, length: number) => void): Promise<number> | void {
    throw new Error('Not implemented yet');
  }
}
