import type { IStorage, Schemas } from '../types';
import { VersionBuilder } from './version-builder';
import { MemoryAdapter } from '../adapters/memory';

export class Persephone {
  private _name: string;
  private _adapter: IStorage | null = null;
  private _schemas: Schemas = {};
  private _version: number = 1;

  constructor(name: string) {
    this._name = name;
  }

  get name(): string {
    return this._name;
  }

  get adapter(): IStorage | null {
    return this._adapter;
  }

  get schemas(): Schemas {
    return this._schemas;
  }

  get currentVersion(): number {
    return this._version;
  }

  version(version: number): VersionBuilder {
    this._version = version;
    return new VersionBuilder(this, version);
  }

  _setSchemas(schemas: Schemas): void {
    this._schemas = schemas;
  }

  useLocalStorage(): this {
    // TODO: localStorage adapter
    throw new Error('Not implemented yet');
  }

  useSessionStorage(): this {
    // TODO: sessionStorage адаптер
    throw new Error('Not implemented yet');
  }

  useMemory(): this {
    this._adapter = new MemoryAdapter();
    return this;
  }

  use(adapter: IStorage): this {
    this._adapter = adapter;
    return this;
  }

  get<T>(_key: string): Promise<T | null>;
  get<T>(_key: string, _callback: (err: Error | null, value: T | null) => void): void;
  get<T>(_key: string, _callback?: (err: Error | null, value: T | null) => void): Promise<T | null> | void {
    throw new Error('Not implemented yet');
  }

  set<T>(_key: string, _value: T): Promise<void>;
  set<T>(_key: string, _value: T, _callback: (err: Error | null) => void): void;
  set<T>(_key: string, _value: T, _callback?: (err: Error | null) => void): Promise<void> | void {
    throw new Error('Not implemented yet');
  }

  remove(_key: string): Promise<void>;
  remove(_key: string, _callback: (err: Error | null) => void): void;
  remove(_key: string, _callback?: (err: Error | null) => void): Promise<void> | void {
    throw new Error('Not implemented yet');
  }

  clear(): Promise<void>;
  clear(_callback: (err: Error | null) => void): void;
  clear(_callback?: (err: Error | null) => void): Promise<void> | void {
    throw new Error('Not implemented yet');
  }

  keys(): Promise<string[]>;
  keys(_callback: (err: Error | null, keys: string[]) => void): void;
  keys(_callback?: (err: Error | null, keys: string[]) => void): Promise<string[]> | void {
    throw new Error('Not implemented yet');
  }

  length(): Promise<number>;
  length(_callback: (err: Error | null, length: number) => void): void;
  length(_callback?: (err: Error | null, length: number) => void): Promise<number> | void {
    throw new Error('Not implemented yet');
  }
}

