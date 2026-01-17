import type { Validator } from './validation';

/**
 * Data migration function
 */
export type Migration<T> = {
  version: number;
  migrate: (data: unknown) => T | Promise<T>;
};

/**
 * Reconciliation strategy when versions don't match
 */
export type Reconciliation<T> = 
  | 'migrate'      // Execute migrations
  | 'reset'        // Restore to default
  | 'ignore'       // Ignore and return null
  | ((data: unknown, currentVersion: number, targetVersion: number) => T | Promise<T>);

/**
 * Schema for a specific key
 */
export interface Schema<T> {
  /**
   * Current schema version
   */
  version: number;
  
  /**
   * Default value (used if no data exists)
   */
  default: T;
  
  /**
   * Array of migrations for data updates
   */
  migrations?: Migration<T>[];
  
  /**
   * Reconciliation strategy when versions don't match
   */
  reconciliation?: Reconciliation<T>;
  
  /**
   * Custom serialization (default is JSON.stringify)
   */
  serialize?: (value: T) => string;
  
  /**
   * Custom deserialization (default is JSON.parse)
   */
  deserialize?: (value: string) => T;
  
  /**
   * Data validator (standard schema - Zod, Yup, etc.)
   * 
   * @example
   * ```typescript
   * import { z } from 'zod';
   * 
   * schema: {
   *   validator: z.object({
   *     name: z.string(),
   *     age: z.number()
   *   })
   * }
   * ```
   */
  validator?: Validator<T>;
}

/**
 * Schemas for all database keys
 */
export type Schemas = Record<string, Schema<unknown>>;
