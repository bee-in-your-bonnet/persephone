import type { Schema } from '../types/schema';
import { MigrationError } from '../errors/migration.error';
import { deserialize, serialize } from './serialization';

/**
 * Version metadata for a key in storage
 */
interface VersionMetadata {
  version: number;
}

/**
 * Prefix for version metadata keys
 */
const VERSION_PREFIX = '__persephone_version__';

/**
 * Get storage key for version metadata
 */
function getVersionKey(key: string): string {
  return `${VERSION_PREFIX}${key}`;
}

/**
 * Get current version of data from storage
 * 
 * @param adapter - Storage adapter
 * @param key - Data key
 * @returns Version number or null if not found
 */
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

/**
 * Save data version to storage
 * 
 * @param adapter - Storage adapter
 * @param key - Data key
 * @param version - Version number to save
 */
export async function setStoredVersion(
  adapter: { setItem(key: string, value: string): Promise<void> },
  key: string,
  version: number
): Promise<void> {
  const versionKey = getVersionKey(key);
  const metadata: VersionMetadata = { version };
  await adapter.setItem(versionKey, JSON.stringify(metadata));
}

/**
 * Execute migrations for data
 * 
 * @param data - Source data
 * @param schema - Schema with migrations
 * @param fromVersion - Current data version
 * @param toVersion - Target schema version
 * @returns Migrated data
 */
export async function executeMigrations<T>(
  data: unknown,
  schema: Schema<T>,
  fromVersion: number,
  toVersion: number
): Promise<T> {
  if (fromVersion >= toVersion) {
    // Version is already up to date or newer
    return data as T;
  }

  if (!schema.migrations || schema.migrations.length === 0) {
    // No migrations - return data as is or default
    if (fromVersion === 0) {
      return schema.default;
    }
    return data as T;
  }

  // Sort migrations by version
  const sortedMigrations = [...schema.migrations].sort((a, b) => a.version - b.version);
  
  // Filter migrations that need to be applied
  const migrationsToApply = sortedMigrations.filter(
    (migration) => migration.version > fromVersion && migration.version <= toVersion
  );

  if (migrationsToApply.length === 0) {
    return data as T;
  }

  // Apply migrations sequentially
  let migratedData: unknown = data;
  
  for (const migration of migrationsToApply) {
    try {
      migratedData = await migration.migrate(migratedData);
    } catch (error) {
      throw new MigrationError(
        error instanceof Error ? error.message : String(error),
        'unknown', // key will be set in calling code
        fromVersion,
        migration.version,
        error
      );
    }
  }

  return migratedData as T;
}

/**
 * Initialize data for a key (execute migrations if needed)
 * 
 * @param adapter - Storage adapter
 * @param key - Data key
 * @param schema - Schema for the key
 * @returns Migrated data or null if no data exists
 */
export async function initializeKey<T>(
  adapter: { 
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
  },
  key: string,
  schema: Schema<T>
): Promise<T | null> {
  // Get current data version
  const storedVersion = await getStoredVersion(adapter, key);
  
  // Get data
  const rawData = await adapter.getItem(key);
  
  if (!rawData) {
    // No data - set version and return default
    await setStoredVersion(adapter, key, schema.version);
    return schema.default;
  }

  // Deserialize data
  const data = deserialize(rawData, schema);

  // If version is not specified, consider it version 0 (old data)
  const fromVersion = storedVersion ?? 0;
  const toVersion = schema.version;

  if (fromVersion === toVersion) {
    // Version is up to date
    return data as T;
  }

  // Migrations needed
  let migratedData: T;
  
  if (fromVersion < toVersion) {
    // Execute migrations
    migratedData = await executeMigrations(data, schema, fromVersion, toVersion);
  } else {
    // Data version is newer than schema - use reconciliation
    const reconciliation = schema.reconciliation ?? 'migrate';
    
    if (reconciliation === 'reset') {
      migratedData = schema.default;
    } else if (reconciliation === 'ignore') {
      return null;
    } else if (reconciliation === 'migrate') {
      // Try to apply migrations in reverse order (not recommended)
      migratedData = await executeMigrations(data, schema, toVersion, fromVersion);
    } else if (typeof reconciliation === 'function') {
      migratedData = await reconciliation(data, fromVersion, toVersion);
    } else {
      migratedData = schema.default;
    }
  }

  // Save migrated data and update version
  const serialized = serialize(migratedData, schema);
  await adapter.setItem(key, serialized);
  await setStoredVersion(adapter, key, schema.version);

  return migratedData;
}
