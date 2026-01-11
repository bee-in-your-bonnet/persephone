import type { Callback } from '../types';

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