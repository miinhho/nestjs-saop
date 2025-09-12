import { logger } from './aop-logger';

describe('AOP Internal Logger', () => {
  it('should have proper logger methods available', () => {
    expect(typeof logger.log).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });
});
