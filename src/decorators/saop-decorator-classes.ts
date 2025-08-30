import type {
  AOPContext,
  ISAOPDecorator,
  SAOPOptions,
} from '@/interfaces/saop-decorator.interface';
import { AOP_TYPES, SAOP_METADATA_KEY } from '@/interfaces/saop-decorator.interface';
import { Injectable } from '@nestjs/common';

/**
 * Base class for SAOP decorators
 * @template T - Method return type
 * @template E - Error type
 */
@Injectable()
export abstract class SAOPDecorator<T = unknown, E = unknown> implements ISAOPDecorator<T, E> {
  /**
   * Static decorator method - similar to NestJS UseInterceptor() pattern
   * @param options - Decorator options
   * @returns Decorator function
   * @example
   * ```typescript
   * ＠LoggingDecorator.create({ level: 'info' })
   * async myMethod() { ... }
   * ```
   */
  static create(this: new () => SAOPDecorator, options: SAOPOptions = {}) {
    return (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => {
      const decoratorClass = this.name;

      const existingDecorators =
        Reflect.getMetadata(SAOP_METADATA_KEY, target.constructor, propertyKey) || [];
      existingDecorators.push({
        type: AOP_TYPES.AROUND,
        options,
        decoratorClass,
      });
      Reflect.defineMetadata(
        SAOP_METADATA_KEY,
        existingDecorators,
        target.constructor,
        propertyKey,
      );
    };
  }

  /**
   * Around decorator (optional implementation)
   * @param context - Method and options context
   * @returns Wrapped method function
   */
  around?(context: Pick<AOPContext<T, E>, 'method' | 'options'>): (...args: any[]) => T;

  /**
   * Before decorator (optional implementation)
   * @param context - Method and options context
   * @returns Callback function
   */
  before?(context: Pick<AOPContext<T, E>, 'method' | 'options'>): (...args: any[]) => void;

  /**
   * After decorator (optional implementation)
   * @param context - Method and options context
   * @returns Callback function
   */
  after?(context: Pick<AOPContext<T, E>, 'method' | 'options'>): (...args: any[]) => void;

  /**
   * AfterReturning decorator (optional implementation)
   * @param context - Method, options, and result context
   * @returns Callback function
   */
  afterReturning?(
    context: Pick<AOPContext<T, E>, 'method' | 'options' | 'result'>,
  ): (...args: any[]) => void;

  /**
   * AfterThrowing decorator (optional implementation)
   * @param context - Method, options, and error context
   * @returns Callback function
   */
  afterThrowing?(
    context: Pick<AOPContext<T, E>, 'method' | 'options' | 'error'>,
  ): (...args: any[]) => void;
}
