import type { IStorage } from '../../types/storage';
import { StorageError } from '../../errors/storage.error';

declare const require: {
  (id: string): any;
};

const fs = typeof require !== 'undefined' ? require('fs').promises : null;
const path = typeof require !== 'undefined' ? require('path') : null;

export class FileSystemAdapter implements IStorage {
  private basePath: string;

  constructor(basePath: string) {
    if (!fs || !path) {
      throw new StorageError('FileSystem adapter requires Node.js environment');
    }
    this.basePath = basePath;
  }

  private getFilePath(key: string): string {
    if (!path) {
      throw new StorageError('FileSystem adapter requires Node.js environment');
    }
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.basePath, `${safeKey}.json`);
  }

  private async ensureDirectory(): Promise<void> {
    if (!fs) {
      throw new StorageError('FileSystem adapter requires Node.js environment');
    }
    try {
      await fs.mkdir(this.basePath, { recursive: true });
    } catch (error) {
      const err = error as { code?: string };
      if (err.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (!fs) {
      throw new StorageError('FileSystem adapter requires Node.js environment');
    }
    try {
      await this.ensureDirectory();
      const filePath = this.getFilePath(key);
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        return data;
      } catch (error) {
        const err = error as { code?: string };
        if (err.code === 'ENOENT') {
          return null;
        }
        throw error;
      }
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        key,
        'getItem',
        error
      );
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!fs) {
      throw new StorageError('FileSystem adapter requires Node.js environment');
    }
    try {
      await this.ensureDirectory();
      const filePath = this.getFilePath(key);
      await fs.writeFile(filePath, value, 'utf-8');
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        key,
        'setItem',
        error
      );
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!fs) {
      throw new StorageError('FileSystem adapter requires Node.js environment');
    }
    try {
      const filePath = this.getFilePath(key);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        const err = error as { code?: string };
        if (err.code !== 'ENOENT') {
          throw error;
        }
      }
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        key,
        'removeItem',
        error
      );
    }
  }

  async clear(): Promise<void> {
    if (!fs || !path) {
      throw new StorageError('FileSystem adapter requires Node.js environment');
    }
    try {
      await this.ensureDirectory();
      const files = await fs.readdir(this.basePath);
      const jsonFiles = files.filter((file: string) => file.endsWith('.json'));
      await Promise.all(
        jsonFiles.map((file: string) => fs.unlink(path.join(this.basePath, file)))
      );
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        undefined,
        'clear',
        error
      );
    }
  }

  async keys(): Promise<string[]> {
    if (!fs) {
      throw new StorageError('FileSystem adapter requires Node.js environment');
    }
    try {
      await this.ensureDirectory();
      const files = await fs.readdir(this.basePath);
      const jsonFiles = files.filter((file: string) => file.endsWith('.json'));
      return jsonFiles.map((file: string) => file.replace(/\.json$/, ''));
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        undefined,
        'keys',
        error
      );
    }
  }

  async length(): Promise<number> {
    if (!fs) {
      throw new StorageError('FileSystem adapter requires Node.js environment');
    }
    try {
      await this.ensureDirectory();
      const files = await fs.readdir(this.basePath);
      const jsonFiles = files.filter((file: string) => file.endsWith('.json'));
      return jsonFiles.length;
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : String(error),
        undefined,
        'length',
        error
      );
    }
  }
}
