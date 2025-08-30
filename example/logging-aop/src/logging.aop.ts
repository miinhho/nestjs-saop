/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from 'nestjs-saop';

@Injectable()
export class LoggingAOP extends SAOPDecorator<string, Error> {
  around({ method }): (...args: any[]) => string {
    return (...args: any[]) => {
      console.log('Around: Before method call', ...args);
      const result = method.apply(this, args);
      console.log('Around: After method call', result);
      return result;
    };
  }

  after({ method: _ }) {
    return () => {
      console.log('After: Method has been called');
    };
  }

  before({ method: _ }) {
    return (...args: any[]) => {
      console.log('Before: Method is about to be called with args:', ...args);
    };
  }

  afterReturning({ method, options, result }) {
    return (...args: any[]) => {
      console.log('AfterReturning: Method returned', result);
    };
  }

  afterThrowing({ method, options, error }) {
    return (...args: any[]) => {
      console.log('AfterThrowing: Method threw an error:', error.message);
    };
  }
}
