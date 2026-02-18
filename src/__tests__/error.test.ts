import { VloexError } from '../types/error';

describe('VloexError', () => {
  it('creates error with message only', () => {
    const err = new VloexError('something failed');
    expect(err.message).toBe('something failed');
    expect(err.name).toBe('VloexError');
    expect(err.statusCode).toBeUndefined();
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(VloexError);
  });

  it('creates error with message and status code', () => {
    const err = new VloexError('unauthorized', 401);
    expect(err.message).toBe('unauthorized');
    expect(err.statusCode).toBe(401);
    expect(err.name).toBe('VloexError');
  });

  it('preserves prototype chain for instanceof checks', () => {
    const err = new VloexError('test', 500);
    expect(err instanceof VloexError).toBe(true);
    expect(err instanceof Error).toBe(true);
    expect(Object.getPrototypeOf(err)).toBe(VloexError.prototype);
  });

  it('has a stack trace', () => {
    const err = new VloexError('trace test');
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain('VloexError');
  });
});
