/**
 * Standard validation interface (compatible with Zod, Yup and others)
 * 
 * Most validation libraries follow this interface:
 * - parse(data: unknown): T - parsing with error throwing
 * - safeParse(data: unknown): { success: boolean; data?: T; error?: unknown } - safe parsing
 */
export interface StandardValidator<T> {
  /**
   * Parse data with error throwing for invalid data
   * @throws ValidationError or library validation error
   */
  parse(data: unknown): T;

  /**
   * Safe parsing without error throwing
   * @returns Object with parsing result
   */
  safeParse(data: unknown): {
    success: boolean;
    data?: T;
    error?: unknown;
  };
}

/**
 * Adapter for standard validation libraries
 * Allows using Zod, Yup and others directly
 */
export type Validator<T> = StandardValidator<T>;

/**
 * Utility to check if object is a standard validator
 */
export function isStandardValidator<T>(obj: unknown): obj is StandardValidator<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'parse' in obj &&
    typeof (obj as StandardValidator<T>).parse === 'function' &&
    ('safeParse' in obj
      ? typeof (obj as StandardValidator<T>).safeParse === 'function'
      : true)
  );
}
