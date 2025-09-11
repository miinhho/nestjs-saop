import { Logger } from '@nestjs/common';
import { logger } from './aop-logger';

describe('AOP Internal Logger', () => {
  it('should be an instance of Logger', () => {
    expect(logger).toBeInstanceOf(Logger);
  });
});
