import type { IStorage } from '../../types/storage';
import { StorageError } from '../../errors/storage.error';

export class CookieAdapter implements IStorage {
  private defaultOptions: {
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
  };

  constructor(options?: {
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
  }) {
    this.defaultOptions = {
      path: '/',
      ...options,
    };
  }

  private getCookies(): Record<string, string> {
    if (typeof document === 'undefined') {
      throw new StorageError('document is not available in this environment');
    }

    const cookies: Record<string, string> = {};
    if (document.cookie) {
      document.cookie.split(';').forEach((cookie) => {
        const [name, ...valueParts] = cookie.trim().split('=');
        if (name) {
          cookies[decodeURIComponent(name)] = decodeURIComponent(valueParts.join('='));
        }
      });
    }
    return cookies;
  }

  private setCookie(
    name: string,
    value: string,
    options?: {
      expires?: Date;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
      maxAge?: number;
    }
  ): void {
    if (typeof document === 'undefined') {
      throw new StorageError('document is not available in this environment');
    }

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    const opts = { ...this.defaultOptions, ...options };

    if (opts.expires) {
      cookieString += `; expires=${opts.expires.toUTCString()}`;
    }

    if (opts.maxAge !== undefined) {
      cookieString += `; max-age=${opts.maxAge}`;
    }

    if (opts.path) {
      cookieString += `; path=${opts.path}`;
    }

    if (opts.domain) {
      cookieString += `; domain=${opts.domain}`;
    }

    if (opts.secure) {
      cookieString += `; secure`;
    }

    if (opts.sameSite) {
      cookieString += `; samesite=${opts.sameSite}`;
    }

    document.cookie = cookieString;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const cookies = this.getCookies();
      return cookies[key] ?? null;
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
    try {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      this.setCookie(key, value, { expires });
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
    try {
      const expires = new Date(0);
      this.setCookie(key, '', { expires });
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
    try {
      const cookies = this.getCookies();
      const expires = new Date(0);
      for (const key of Object.keys(cookies)) {
        this.setCookie(key, '', { expires });
      }
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
    try {
      const cookies = this.getCookies();
      return Object.keys(cookies);
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
    try {
      const cookies = this.getCookies();
      return Object.keys(cookies).length;
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
