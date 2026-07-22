/**
 * Custom error classes for the School Attendance Monitoring System.
 */

/**
 * Represents a "resource not found" error with HTTP 404 semantics.
 * Thrown by service functions when a requested entity does not exist.
 */
export class NotFoundError extends Error {
  public readonly statusCode: 404 = 404;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    // Restore the prototype chain (required when extending built-in Error in TypeScript)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
