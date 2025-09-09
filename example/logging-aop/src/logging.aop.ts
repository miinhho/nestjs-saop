/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  AOPDecorator,
  AOPMethod,
  Aspect,
  ErrorAOPContext,
  ResultAOPContext,
  UnitAOPContext,
} from 'nestjs-saop';

export type LoggingOptions = {
  logLevel?: 'info' | 'debug' | 'error';
};

@Aspect()
export class LoggingAOP extends AOPDecorator {
  around({ method, options }: UnitAOPContext<LoggingOptions>): AOPMethod {
    return (...args: any[]): any => {
      console.log('Around: Before method call', args, options);
      const result = method.apply(this, args);
      console.log('Around: After method call', result);
      return result;
    };
  }

  after({ method }: UnitAOPContext<LoggingOptions>): AOPMethod<void> {
    return (...args: any[]) => {
      console.log('After: Method has been called with args:', args);
      console.log('After: Method reference:', method);
    };
  }

  before({ method }: UnitAOPContext<LoggingOptions>): AOPMethod<void> {
    return (...args: any[]) => {
      console.log('Before: Method is about to be called with args:', args);
      console.log('Before: Method reference:', method);
    };
  }

  afterReturning({
    result,
  }: ResultAOPContext<LoggingOptions>): AOPMethod<void> {
    return (...args: any[]) => {
      console.log('AfterReturning: Method returned', result);
      console.log('AfterReturning: Called with args:', args);
    };
  }

  afterThrowing({
    error,
  }: ErrorAOPContext<LoggingOptions, Error>): AOPMethod<void> {
    return (...args: any[]) => {
      console.log('AfterThrowing: Method threw an error:', error?.message);
      console.log('AfterThrowing: Called with args:', args);
    };
  }
}
