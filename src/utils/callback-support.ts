import type { Callback } from '../types/persistor';

/**
 * Wrapper for supporting both Promises and callbacks
 * If callback is provided, uses callback, otherwise returns Promise
 * 
 * @param promise - Promise to wrap
 * @param callback - Optional callback
 * @returns Promise or void (if callback is provided)
 */
export function withCallback<T>(
  promise: Promise<T>,
  callback?: Callback<T>
): Promise<T> | void {
  if (callback) {
    promise
      .then((result) => callback(null, result))
      .catch((err) => callback(err instanceof Error ? err : new Error(String(err))));
    return;
  }
  return promise;
}
