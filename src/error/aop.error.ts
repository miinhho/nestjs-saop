/**
 * Custom error class for AOP-related errors.
 */
export class AOPError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AOPError';
  }
}
