/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { AOPDecorator, AOPMethod, AroundAOPContext, Aspect } from 'nestjs-saop';
import { ExampleLogService } from './example-log.service';
import { LoggingOptions } from './logging.aop';

@Aspect({ order: 1 })
export class PrimaryLoggingAOP extends AOPDecorator {
  constructor(private readonly exampleLogService: ExampleLogService) {
    super();
  }

  around({
    method,
    options,
    proceed,
  }: AroundAOPContext<LoggingOptions>): AOPMethod {
    return (...args: any[]): any => {
      console.log(
        'Primary Around: Before method call',
        method.name,
        args,
        options,
      );
      const result = proceed(args);
      console.log(this.exampleLogService.getLog('Primary Around executed'));
      console.log('Primary Around: After method call', result);
      return result;
    };
  }
}
