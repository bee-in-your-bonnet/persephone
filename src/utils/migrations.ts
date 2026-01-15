import type { Schema } from '../types/schema';
import { MigrationError } from '../errors/migration.error';
import { deserialize, serialize } from './serialization';

interface VersionMetadata {
  version: number;
}

export const VERSION_PREFIX = '__persephone_version__';

export function getVersionKey(key: string): string {
  return `${VERSION_PREFIX}${key}`;
}

export function isVersionKey(key: string): boolean {
  return key.startsWith(VERSION_PREFIX);
}

export async function getStoredVersion(
  adapter: { getItem(key: string): Promise<string | null> },
  key: string
): Promise<number | null> {
  const versionKey = getVersionKey(key);
  const versionData = await adapter.getItem(versionKey);
  
  if (!versionData) {
    return null;
  }
  
  try {
    const metadata = JSON.parse(versionData) as VersionMetadata;
    return metadata.version;
  } catch {
    return null;
  }
}

export async function setStoredVersion(
  adapter: { setItem(key: string, value: string): Promise<void> },
  key: string,
  version: number
): Promise<void> {
  const versionKey = getVersionKey(key);
  const metadata: VersionMetadata = { version };
  await adapter.setItem(versionKey, JSON.stringify(metadata));
}

export async function executeMigrations<T>(
  data: unknown,
  schema: Schema<T>,
  fromVersion: number,
  toVersion: number
): Promise<T> {
  if (fromVersion >= toVersion) {
    return data as T;
  }

  if (!schema.migrations || schema.migrations.length === 0) {
    if (fromVersion === 0) {
      return schema.default;
    }
    return data as T;
  }

  const sortedMigrations = [...schema.migrations].sort((a, b) => a.version - b.version);
  
  const migrationsToApply = sortedMigrations.filter(
    (migration) => migration.version > fromVersion && migration.version <= toVersion
  );

  if (migrationsToApply.length === 0) {
    return data as T;
  }

  let migratedData: unknown = data;
  
  for (const migration of migrationsToApply) {
    try {
      migratedData = await migration.migrate(migratedData);
    } catch (error) {
      throw new MigrationError(
        error instanceof Error ? error.message : String(error),
        'unknown',
        fromVersion,
        migration.version,
        error
      );
    }
  }

  return migratedData as T;
}

export async function initializeKey<T>(
  adapter: { 
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
  },
  key: string,
  schema: Schema<T>
): Promise<T | null> {
  const storedVersion = await getStoredVersion(adapter, key);
  
  const rawData = await adapter.getItem(key);
  
  if (!rawData) {
    await setStoredVersion(adapter, key, schema.version);
    return schema.default;
  }

  const data = deserialize(rawData, schema);

  const fromVersion = storedVersion ?? 0;
  const toVersion = schema.version;

  if (fromVersion === toVersion) {
    return data as T;
  }

  let migratedData: T;
  
  if (fromVersion < toVersion) {
    migratedData = await executeMigrations(data, schema, fromVersion, toVersion);
  } else {
    const reconciliation = schema.reconciliation ?? 'migrate';
    
    if (reconciliation === 'reset') {
      migratedData = schema.default;
    } else if (reconciliation === 'ignore') {
      return null;
    } else if (reconciliation === 'migrate') {
      migratedData = await executeMigrations(data, schema, toVersion, fromVersion);
    } else if (typeof reconciliation === 'function') {
      migratedData = await reconciliation(data, fromVersion, toVersion);
    } else {
      migratedData = schema.default;
    }
  }

  const serialized = serialize(migratedData, schema);
  await adapter.setItem(key, serialized);
  await setStoredVersion(adapter, key, schema.version);

  return migratedData;
}
