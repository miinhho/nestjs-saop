import { Injectable } from '@nestjs/common';
import type {
  AOPMethod,
  AOPOptions,
  ErrorAOPContext,
  IAOPDecorator,
  ResultAOPContext,
  UnitAOPContext,
} from '../interfaces';
import { AOP_TYPES } from '../interfaces';
import { addMetadata } from '../utils';

/**
 * Base abstract class for AOP decorators
 *
 * @template O - Options type
 * @template T - Method return type (default: `any`)
 * @template E - Error type (default: `unknown`)
 */
@Injectable()
export abstract class AOPDecorator<O extends AOPOptions = AOPOptions, T = any, E = unknown>
  implements IAOPDecorator<O, T, E>
{
  /**
   * Static decorator method for around
   * @param options - Decorator options
   */
  static around<O extends AOPOptions = AOPOptions>(
    this: new () => AOPDecorator<O>,
    options: O = {} as O,
  ): MethodDecorator {
    return (target: any, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
      const decoratorClass = this.name;
      addMetadata({
        decoratorClass,
        target,
        propertyKey,
        options,
        type: AOP_TYPES.AROUND,
      });
    };
  }

  /**
   * Static decorator method for before
   * @param options - Decorator options
   */
  static before<O extends AOPOptions = AOPOptions>(
    this: new () => AOPDecorator<O>,
    options: O = {} as O,
  ): MethodDecorator {
    return (target: any, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
      const decoratorClass = this.name;
      addMetadata({
        decoratorClass,
        target,
        propertyKey,
        options,
        type: AOP_TYPES.BEFORE,
      });
    };
  }

  /**
   * Static decorator method for after
   * @param options - Decorator options
   */
  static after<O extends AOPOptions = AOPOptions>(
    this: new () => AOPDecorator<O>,
    options: O = {} as O,
  ): MethodDecorator {
    return (target: any, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
      const decoratorClass = this.name;
      addMetadata({
        decoratorClass,
        target,
        propertyKey,
        options,
        type: AOP_TYPES.AFTER,
      });
    };
  }

  /**
   * Static decorator method for afterReturning
   * @param options - Decorator options
   */
  static afterReturning<O extends AOPOptions = AOPOptions>(
    this: new () => AOPDecorator<O>,
    options: O = {} as O,
  ): MethodDecorator {
    return (target: any, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
      const decoratorClass = this.name;
      addMetadata({
        decoratorClass,
        target,
        propertyKey,
        options,
        type: AOP_TYPES.AFTER_RETURNING,
      });
    };
  }

  /**
   * Static decorator method for afterThrowing
   * @param options - Decorator options
   */
  static afterThrowing<O extends AOPOptions = AOPOptions>(
    this: new () => AOPDecorator<O>,
    options: O = {} as O,
  ): MethodDecorator {
    return (target: any, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
      const decoratorClass = this.name;
      addMetadata({
        decoratorClass,
        target,
        propertyKey,
        options,
        type: AOP_TYPES.AFTER_THROWING,
      });
    };
  }

  /**
   * Around decorator (optional implementation)
   * @param context - Method and options context
   * @returns Wrapped method function
   */
  around?(context: UnitAOPContext<O>): AOPMethod<T>;

  /**
   * Before decorator (optional implementation)
   * @param context - Method and options context
   * @returns Callback function
   */
  before?(context: UnitAOPContext<O>): AOPMethod<void>;

  /**
   * After decorator (optional implementation)
   * @param context - Method and options context
   * @returns Callback function
   */
  after?(context: UnitAOPContext<O>): AOPMethod<void>;

  /**
   * AfterReturning decorator (optional implementation)
   * @param context - Method, options, and result context
   * @returns Callback function
   */
  afterReturning?(context: ResultAOPContext<O, T>): AOPMethod<void>;

  /**
   * AfterThrowing decorator (optional implementation)
   * @param context - Method, options, and error context
   * @returns Callback function
   */
  afterThrowing?(context: ErrorAOPContext<O, E>): AOPMethod<void>;
}
