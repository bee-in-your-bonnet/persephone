import type { IStorage } from '../../types/storage';
import { StorageError } from '../../errors/storage.error';

interface KeyDBClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void | string>;
  del(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  flushdb(): Promise<void>;
  dbsize(): Promise<number>;
}

export class KeyDBAdapter implements IStorage {
  private client: KeyDBClient;

  constructor(client: KeyDBClient) {
    this.client = client;
  }

  getItem = async (key: string): Promise<string | null> => {
    try {
      return await this.client.get(key);
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        key,
        'getItem',
        error
      );
    }
  };

  setItem = async (key: string, value: string): Promise<void> => {
    try {
      await this.client.set(key, value);
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        key,
        'setItem',
        error
      );
    }
  };

  removeItem = async (key: string): Promise<void> => {
    try {
      await this.client.del(key);
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        key,
        'removeItem',
        error
      );
    }
  };

  clear = async (): Promise<void> => {
    try {
      await this.client.flushdb();
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        undefined,
        'clear',
        error
      );
    }
  };

  keys = async (): Promise<string[]> => {
    try {
      return await this.client.keys('*');
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        undefined,
        'keys',
        error
      );
    }
  };

  length = async (): Promise<number> => {
    try {
      return await this.client.dbsize();
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        undefined,
        'length',
        error
      );
    }
  };
}
