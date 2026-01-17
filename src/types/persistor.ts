/**
 * Callback for asynchronous operations
 */
export type Callback<T> = (err: Error | null, result?: T) => void;

/**
 * Interface for working with a specific key (typed)
 */
export interface IPersistor<T> {
  /**
   * Get value
   */
  get(): Promise<T | null>;
  get(callback: Callback<T | null>): void;
  
  /**
   * Set value
   */
  set(value: T): Promise<void>;
  set(value: T, callback: Callback<void>): void;
  
  /**
   * Remove value
   */
  remove(): Promise<void>;
  remove(callback: Callback<void>): void;
}

/**
 * Main persistence service interface
 */
export interface IPersistorService {
  /**
   * Get value by key
   */
  get<T>(key: string): Promise<T | null>;
  get<T>(key: string, callback: Callback<T | null>): void;
  
  /**
   * Set value by key
   */
  set<T>(key: string, value: T): Promise<void>;
  set<T>(key: string, value: T, callback: Callback<void>): void;
  
  /**
   * Remove value by key
   */
  remove(key: string): Promise<void>;
  remove(key: string, callback: Callback<void>): void;
  
  /**
   * Clear all values
   */
  clear(): Promise<void>;
  clear(callback: Callback<void>): void;
  
  /**
   * Get all keys
   */
  keys(): Promise<string[]>;
  keys(callback: Callback<string[]>): void;
  
  /**
   * Get number of items
   */
  length(): Promise<number>;
  length(callback: Callback<number>): void;
}
