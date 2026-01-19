import type { IStorage } from '../../types/storage';

export class MemoryAdapter implements IStorage {
  private storage: Map<string, string> = new Map();

  getItem = async (key: string): Promise<string | null> => {
    return this.storage.get(key) ?? null;
  };

  setItem = async (key: string, value: string): Promise<void> => {
    this.storage.set(key, value);
  };

  removeItem = async (key: string): Promise<void> => {
    this.storage.delete(key);
  };

  clear = async (): Promise<void> => {
    this.storage.clear();
  };

  keys = async (): Promise<string[]> => {
    return Array.from(this.storage.keys());
  };

  length = async (): Promise<number> => {
    return this.storage.size;
  };
}

