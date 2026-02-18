/**
 * VloexError - Custom error class for API errors
 */
export class VloexError extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'VloexError';
    this.statusCode = statusCode;
    // Fix prototype chain for instanceof checks in transpiled code
    Object.setPrototypeOf(this, VloexError.prototype);
  }
}
