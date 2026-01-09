export type Callback<T> = (err: Error | null, result?: T) => void;

export interface IPersistor<T> {
  get(): Promise<T | null>;
  get(callback: Callback<T | null>): void;
  set(value: T): Promise<void>;
  set(value: T, callback: Callback<void>): void;
  remove(): Promise<void>;
  remove(callback: Callback<void>): void;
}

export interface IPersistorService {
  get<T>(key: string): Promise<T | null>;
  get<T>(key: string, callback: Callback<T | null>): void;
  set<T>(key: string, value: T): Promise<void>;
  set<T>(key: string, value: T, callback: Callback<void>): void;
  remove(key: string): Promise<void>;
  remove(key: string, callback: Callback<void>): void;
  clear(): Promise<void>;
  clear(callback: Callback<void>): void;
  keys(): Promise<string[]>;
  keys(callback: Callback<string[]>): void;
  length(): Promise<number>;
  length(callback: Callback<number>): void;
}

