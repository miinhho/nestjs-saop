import { Injectable } from '@nestjs/common';
import type {
  AfterAOP,
  AfterReturningAOP,
  AfterThrowingAOP,
  AOPMethod,
  AOPOptions,
  AroundAOP,
  BeforeAOP,
  ErrorAOPContext,
  IAOPDecorator,
  ResultAOPContext,
  UnitAOPContext,
} from '../interfaces';
import { AOP_TYPES } from '../interfaces';
import { addMetadata } from '../utils';

/**
 * Constructor signature for AOP decorator classes.
 *
 * @internal
 */
type AOPDecoratorConstructor<Options = AOPOptions> = new () => AOPDecorator<Options>;

/**
 * Provides the foundation for creating custom AOP decorators.
 *
 * @example
 * ```typescript
 * ＠Aspect()
 * export class LoggingAOP extends AOPDecorator {
 *   around({ method, options }: UnitAOPContext) {
 *    return (...args: any[]) => {
 *      console.log('Around: Before method call', ...args, options);
 *      const result = method.apply(this, args);
 *      console.log('Around: After method call', result);
 *      return result;
 *    };
 *   }
 *
 *  // ... implement other advice methods as needed
 *  // e.g. before, after, afterReturning, afterThrowing
 * }
 * ```
 */
@Injectable()
export abstract class AOPDecorator<Options = AOPOptions> implements IAOPDecorator<Options> {
  /**
   * Creates a method decorator that applies around advice to the target method.
   *
   * The around advice has full control over method execution and can modify
   * parameters, conditionally execute the method, or return a different result.
   *
   * @param options - Configuration options for the decorator
   * @returns A method decorator function
   *
   * @example
   * ```typescript
   * ＠LoggingAOP.around<LoggingOptions>({
   *   logLevel: 'info',
   * })
   * getHello(name: string): string {
   *   return `Hello ${name}!`;
   * }
   * ```
   */
  static around<Options = AOPOptions>(
    this: AOPDecoratorConstructor<Options> & AroundAOP<Options>,
    options: Options = {} as Options,
  ): MethodDecorator {
    return (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
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
   * Creates a method decorator that applies before advice to the target method.
   *
   * The before advice executes before the method runs.
   *
   * @param options - Configuration options for the decorator
   * @returns A method decorator function
   *
   * @example
   * ```typescript
   * ＠LoggingAOP.before<LoggingOptions>({
   *   logLevel: 'info',
   * })
   * getHello(name: string): string {
   *   return `Hello ${name}!`;
   * }
   * ```
   */
  static before<Options = AOPOptions>(
    this: AOPDecoratorConstructor<Options> & BeforeAOP<Options>,
    options: Options = {} as Options,
  ): MethodDecorator {
    return (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
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
   * Creates a method decorator that applies after advice to the target method.
   *
   * The after advice executes after the method completes, regardless of whether
   * it succeeded or threw an exception.
   *
   * @param options - Configuration options for the decorator
   * @returns A method decorator function
   *
   * @example
   * ```typescript
   * ＠LoggingAOP.after<LoggingOptions>({
   *   logLevel: 'info',
   * })
   * getHello(name: string): string {
   *   return `Hello ${name}!`;
   * }
   * ```
   */
  static after<Options = AOPOptions>(
    this: AOPDecoratorConstructor<Options> & AfterAOP<Options>,
    options: Options = {} as Options,
  ): MethodDecorator {
    return (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
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
   * Creates a method decorator that applies after-returning advice to the target method.
   *
   * The after-returning advice executes only when the method completes successfully
   * and provides access to the return value for post-processing.
   *
   * @param options - Configuration options for the decorator
   * @returns A method decorator function
   *
   * @example
   * ```typescript
   * ＠LoggingAOP.afterReturning<LoggingOptions>({
   *   logLevel: 'info',
   * })
   * getHello(name: string): string {
   *   return `Hello ${name}!`;
   * }
   * ```
   */
  static afterReturning<Options = AOPOptions>(
    this: AOPDecoratorConstructor<Options> & AfterReturningAOP<Options, any>,
    options: Options = {} as Options,
  ): MethodDecorator {
    return (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
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
   * Creates a method decorator that applies after-throwing advice to the target method.
   *
   * The after-throwing advice executes only when the method throws an exception
   * and provides access to the error for logging, recovery, or re-throwing.
   *
   * @param options - Configuration options for the decorator
   * @returns A method decorator function
   *
   * @example
   * ```typescript
   * ＠LoggingAOP.afterThrowing<LoggingOptions>({
   *   logLevel: 'error',
   * })
   * getError(): string {
   *   throw new Error('This is a test error');
   * }
   * ```
   */
  static afterThrowing<Options = AOPOptions>(
    this: AOPDecoratorConstructor<Options> & AfterThrowingAOP<Options, unknown>,
    options: Options = {} as Options,
  ): MethodDecorator {
    return (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
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
   * Around decorator method (optional implementation)
   *
   * Full control over execution.
   *
   * Can modify parameters, conditionally execute the original method, or return
   * a different result.
   *
   * @param context - Context containing the original method and options
   * @returns A wrapped method function that will be executed
   */
  around?(context: UnitAOPContext<Options>): AOPMethod<any>;

  /**
   * Before decorator method (optional implementation)
   *
   * Executed before the target method runs.
   *
   * @param context - Context containing the original method and options
   * @returns A callback function executed before the method
   */
  before?(context: UnitAOPContext<Options>): AOPMethod<void>;

  /**
   * After decorator method (optional implementation)
   *
   * Executed after the target method completes, whether successfully or with an error.
   *
   * @param context - Context containing the original method and options
   * @returns A callback function executed after the method
   */
  after?(context: UnitAOPContext<Options>): AOPMethod<void>;

  /**
   * AfterReturning decorator method (optional implementation)
   *
   * Executed after the target method returns successfully. Has access to
   * the return value.
   *
   * @param context - Context containing the method, options, and result
   * @returns A callback function executed after successful method completion
   */
  afterReturning?(context: ResultAOPContext<Options>): AOPMethod<void>;

  /**
   * AfterThrowing decorator method (optional implementation)
   *
   * Executed when the target method throws an exception.
   *
   * @param context - Context containing the method, options, and error
   * @returns A callback function executed when an exception occurs
   */
  afterThrowing?(context: ErrorAOPContext<Options>): AOPMethod<void>;
}
