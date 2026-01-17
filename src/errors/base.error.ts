/**
 * Base class for all library errors
 */
export class PersephoneError extends Error {
  readonly code?: string;
  readonly cause?: unknown;

  constructor(message: string, code?: string, cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    
    // Support Error.cause (ES2022)
    if (cause) {
      this.cause = cause;
    }
  }
}
