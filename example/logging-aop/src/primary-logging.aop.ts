/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  AOPDecorator,
  AOPMethod,
  AroundAOPContext,
  Aspect,
  ErrorAOPContext,
  ResultAOPContext,
  UnitAOPContext,
} from 'nestjs-saop';
import { LoggingOptions } from './logging.aop';

@Aspect({ order: 1 })
export class PrimaryLoggingAOP extends AOPDecorator {
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
      const result = proceed(...args);
      console.log('Primary Around: After method call', result);
      return result;
    };
  }

  after({ method }: UnitAOPContext<LoggingOptions>): AOPMethod<void> {
    return (...args: any[]) => {
      console.log('Primary After: Method has been called with args:', args);
      console.log('Primary After: Method reference:', method);
    };
  }

  before({ method }: UnitAOPContext<LoggingOptions>): AOPMethod<void> {
    return (...args: any[]) => {
      console.log(
        'Primary Before: Method is about to be called with args:',
        args,
      );
      console.log('Primary Before: Method reference:', method);
    };
  }

  afterReturning({
    result,
  }: ResultAOPContext<LoggingOptions>): AOPMethod<void> {
    return (...args: any[]) => {
      console.log('Primary AfterReturning: Method returned', result);
      console.log('Primary AfterReturning: Called with args:', args);
    };
  }

  afterThrowing({
    error,
  }: ErrorAOPContext<LoggingOptions, Error>): AOPMethod<void> {
    return (...args: any[]) => {
      console.log(
        'Primary AfterThrowing: Method threw an error:',
        error?.message,
      );
      console.log('Primary AfterThrowing: Called with args:', args);
    };
  }
}
