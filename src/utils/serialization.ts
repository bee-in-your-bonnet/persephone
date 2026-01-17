import type { Schema } from '../types/schema';

/**
 * Serialize value with schema support
 * Uses custom serialization from schema if provided, otherwise JSON.stringify
 * 
 * @param value - Value to serialize
 * @param schema - Optional schema with custom serialization
 * @returns Serialized string
 */
export function serialize<T>(value: T, schema?: Schema<T>): string {
  if (schema?.serialize) {
    return schema.serialize(value);
  }
  return JSON.stringify(value);
}

/**
 * Deserialize value with schema support
 * Uses custom deserialization from schema if provided, otherwise JSON.parse
 * 
 * @param value - Serialized string
 * @param schema - Optional schema with custom deserialization
 * @returns Deserialized value
 */
export function deserialize<T>(value: string, schema?: Schema<T>): T {
  if (schema?.deserialize) {
    return schema.deserialize(value);
  }
  return JSON.parse(value) as T;
}
