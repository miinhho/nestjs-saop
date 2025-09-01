import { Injectable } from '@nestjs/common';
import { LoggingAOP } from './logging.aop';

@Injectable()
export class AppService {
  @LoggingAOP.around({
    logLevel: 'info',
  })
  @LoggingAOP.before()
  @LoggingAOP.afterReturning()
  @LoggingAOP.after()
  getHello(name: string): string {
    return `Hello ${name}!`;
  }

  @LoggingAOP.afterThrowing()
  getError(): string {
    throw new Error('This is a test error');
  }
}
