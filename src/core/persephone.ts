import type { IStorage } from '../types/storage';
import type { Schemas, Schema } from '../types/schema';
import { VersionBuilder } from './version-builder';
import { MemoryAdapter } from '../adapters/memory/memory.adapter';
import { LocalStorageAdapter } from '../adapters/browser/local-storage.adapter';
import { SessionStorageAdapter } from '../adapters/browser/session-storage.adapter';
import { deserialize, serialize } from '../utils/serialization';
import { validate } from '../utils/validation';
import { setStoredVersion, getVersionKey, isVersionKey } from '../utils/migrations';
import { initializeKey } from '../utils/migrations';

export class Persephone {
  private _name: string;
  private _adapter: IStorage | null = null;
  private _schemas: Schemas = {};
  private _version: number = 1;
  private _initialized: boolean = false;

  constructor(name: string) {
    this._name = name;
  }

  get name(): string {
    return this._name;
  }

  get adapter(): IStorage | null {
    return this._adapter;
  }

  get schemas(): Schemas {
    return this._schemas;
  }

  get currentVersion(): number {
    return this._version;
  }

  version(version: number): VersionBuilder {
    this._version = version;
    return new VersionBuilder(this, version);
  }

  _setSchemas(schemas: Schemas): void {
    this._schemas = schemas;
  }

  async open(): Promise<void> {
    if (!this._adapter) {
      throw new Error('Adapter is not set. Call useMemory(), useLocalStorage() or use() first.');
    }

    if (Object.keys(this._schemas).length === 0) {
      throw new Error('Schemas are not set. Call version().schema() first.');
    }

    for (const [key, schema] of Object.entries(this._schemas)) {
      await initializeKey(this._adapter, key, schema as Schema<unknown>);
    }

    this._initialized = true;
  }

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

  useMemory(): this {
    this._adapter = new MemoryAdapter();
    return this;
  }

  use(adapter: IStorage): this {
    this._adapter = adapter;
    return this;
  }

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
      const rawData = await this._adapter!.getItem(key);
      
      if (!rawData) {
        return schema.default;
      }

      const data = deserialize<T>(rawData, schema);

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
      let validatedValue: T = value;
      if (schema.validator) {
        validatedValue = validate<T>(value, schema.validator, key);
      }

      const serialized = serialize(validatedValue, schema);

      await this._adapter!.setItem(key, serialized);

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

  remove(key: string): Promise<void>;
  remove(key: string, callback: (err: Error | null) => void): void;
  remove(key: string, callback?: (err: Error | null) => void): Promise<void> | void {
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

    const promise = (async (): Promise<void> => {
      await this._adapter!.removeItem(key);
      const versionKey = getVersionKey(key);
      await this._adapter!.removeItem(versionKey);
    })();

    if (callback) {
      promise
        .then(() => callback(null))
        .catch((err) => callback(err instanceof Error ? err : new Error(String(err))));
      return;
    }

    return promise;
  }

  clear(): Promise<void>;
  clear(callback: (err: Error | null) => void): void;
  clear(callback?: (err: Error | null) => void): Promise<void> | void {
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

    const promise = (async (): Promise<void> => {
      await this._adapter!.clear();
    })();

    if (callback) {
      promise
        .then(() => callback(null))
        .catch((err) => callback(err instanceof Error ? err : new Error(String(err))));
      return;
    }

    return promise;
  }

  keys(): Promise<string[]>;
  keys(callback: (err: Error | null, keys: string[]) => void): void;
  keys(callback?: (err: Error | null, keys: string[]) => void): Promise<string[]> | void {
    if (!this._adapter) {
      const error = new Error('Adapter is not set');
      if (callback) {
        callback(error, []);
        return;
      }
      return Promise.reject(error);
    }

    if (!this._initialized) {
      const error = new Error('Database is not initialized. Call open() first.');
      if (callback) {
        callback(error, []);
        return;
      }
      return Promise.reject(error);
    }

    const promise = (async (): Promise<string[]> => {
      const allKeys = await this._adapter!.keys();
      return allKeys.filter(key => !isVersionKey(key) && this._schemas[key] !== undefined);
    })();

    if (callback) {
      promise
        .then((keys) => callback(null, keys))
        .catch((err) => callback(err instanceof Error ? err : new Error(String(err)), []));
      return;
    }

    return promise;
  }

  length(): Promise<number>;
  length(callback: (err: Error | null, length: number) => void): void;
  length(callback?: (err: Error | null, length: number) => void): Promise<number> | void {
    if (!this._adapter) {
      const error = new Error('Adapter is not set');
      if (callback) {
        callback(error, 0);
        return;
      }
      return Promise.reject(error);
    }

    if (!this._initialized) {
      const error = new Error('Database is not initialized. Call open() first.');
      if (callback) {
        callback(error, 0);
        return;
      }
      return Promise.reject(error);
    }

    const promise = (async (): Promise<number> => {
      const allKeys = await this._adapter!.keys();
      const dataKeys = allKeys.filter(key => !isVersionKey(key) && this._schemas[key] !== undefined);
      return dataKeys.length;
    })();

    if (callback) {
      promise
        .then((length) => callback(null, length))
        .catch((err) => callback(err instanceof Error ? err : new Error(String(err)), 0));
      return;
    }

    return promise;
  }
}
