import type { IStorage } from '../../types/storage';
import { StorageError } from '../../errors/storage.error';

export class SessionStorageAdapter implements IStorage {
  private getStorage = (): Storage => {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      throw new StorageError('sessionStorage is not available in this environment');
    }
    return window.sessionStorage;
  };

  getItem = async (key: string): Promise<string | null> => {
    try {
      const storage = this.getStorage();
      const value = storage.getItem(key);
      return value;
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        key,
        'getItem',
        error
      );
    }
  }

  setItem = async (key: string, value: string): Promise<void> => {
    try {
      const storage = this.getStorage();
      storage.setItem(key, value);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new StorageError('Storage quota exceeded', key, 'setItem', error);
      }
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        key,
        'setItem',
        error
      );
    }
  }

  removeItem = async (key: string): Promise<void> => {
    try {
      const storage = this.getStorage();
      storage.removeItem(key);
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        key,
        'removeItem',
        error
      );
    }
  }

  clear = async (): Promise<void> => {
    try {
      const storage = this.getStorage();
      storage.clear();
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
      const storage = this.getStorage();
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key !== null) {
          keys.push(key);
        }
      }
      return keys;
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
      const storage = this.getStorage();
      return storage.length;
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
