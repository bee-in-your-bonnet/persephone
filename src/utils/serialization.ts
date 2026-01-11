import type { Schema } from '../types/schema';

export function serialize<T>(value: T, schema?: Schema<T>): string {
  if (schema?.serialize) {
    return schema.serialize(value);
  }
  return JSON.stringify(value);
}

export function deserialize<T>(value: string, schema?: Schema<T>): T {
  if (schema?.deserialize) {
    return schema.deserialize(value);
  }
  return JSON.parse(value) as T;
}