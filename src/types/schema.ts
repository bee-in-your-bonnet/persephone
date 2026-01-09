import type { Validator } from './validation';

export type Migration<T> = {
  version: number;
  migrate: (data: unknown) => T | Promise<T>;
};

export type Reconciliation<T> = 
  | 'migrate'      // do migrations
  | 'reset'        // restore to default
  | 'ignore'       // ignore and return null
  | ((data: unknown, currentVersion: number, targetVersion: number) => T | Promise<T>);

export interface Schema<T> {
  version: number;
  default: T;
  migrations?: Migration<T>[];
  reconciliation?: Reconciliation<T>;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  validator?: Validator<T>;
}

export type Schemas = Record<string, Schema<unknown>>;

