/**
 * Base interface for key-value storage
 * All operations are asynchronous for cross-platform compatibility
 */
export interface IStorage {
  /**
   * Get value by key
   */
  getItem(key: string): Promise<string | null>;
  
  /**
   * Set value by key
   */
  setItem(key: string, value: string): Promise<void>;
  
  /**
   * Remove value by key
   */
  removeItem(key: string): Promise<void>;
  
  /**
   * Clear all values
   */
  clear(): Promise<void>;
  
  /**
   * Get all keys
   */
  keys(): Promise<string[]>;
  
  /**
   * Get number of items
   */
  length(): Promise<number>;
}

/**
 * Alias for compatibility
 */
export type KeyValueStorage = IStorage;
