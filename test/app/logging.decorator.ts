import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from '../../src';

@Injectable()
export class LoggingDecorator extends SAOPDecorator<string, Error> {
  around({ method, options }: { method: Function; options: any }): (...args: any[]) => string {
    return (...args: any[]) => {
      console.log('Around: Before method call', ...args);
      const result = method.apply(this, args);
      console.log('Around: After method call', result);
      return result;
    };
  }

  before({ method, options }: { method: Function; options: any }): (...args: any[]) => void {
    return (...args: any[]) => {
      console.log('Before: Method called with', ...args);
    };
  }

  after({ method, options }: { method: Function; options: any }): (...args: any[]) => void {
    return (...args: any[]) => {
      console.log('After: Method completed');
    };
  }

  afterReturning({
    method,
    options,
    result,
  }: {
    method: Function;
    options: any;
    result: string;
  }): (...args: any[]) => void {
    return (...args: any[]) => {
      console.log('AfterReturning: Method returned', result);
    };
  }

  afterThrowing({
    method,
    options,
    error,
  }: {
    method: Function;
    options: any;
    error: Error;
  }): (...args: any[]) => void {
    return (...args: any[]) => {
      console.log('AfterThrowing: Method threw', error.message);
    };
  }
}
