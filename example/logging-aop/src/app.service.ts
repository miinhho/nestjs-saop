import { Injectable } from '@nestjs/common';
import { LoggingAOP } from './logging.aop';

@Injectable()
export class AppService {
  @LoggingAOP.around()
  @LoggingAOP.before()
  @LoggingAOP.afterReturning()
  @LoggingAOP.after()
  getHello(): string {
    return 'Hello World!';
  }

  @LoggingAOP.afterThrowing()
  getError(): string {
    throw new Error('This is a test error');
  }
}
