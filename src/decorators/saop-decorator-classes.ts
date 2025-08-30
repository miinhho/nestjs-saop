import { Injectable } from '@nestjs/common';
import type { AOPContext, AOPType, ISAOPDecorator, SAOPOptions } from '../interfaces';
import { AOP_TYPES, SAOP_METADATA_KEY } from '../interfaces';

/**
 * Base class for SAOP decorators
 * @template T - Method return type
 * @template E - Error type
 */
@Injectable()
export abstract class SAOPDecorator<T = unknown, E = unknown> implements ISAOPDecorator<T, E> {
  /**
   * Helper method to add decorator metadata
   * @param type - AOP type
   * @param options - Decorator options
   * @param target - Target class
   * @param propertyKey - Method name
   */
  private static addDecorator(
    type: AOPType,
    options: SAOPOptions,
    target: any,
    propertyKey: string,
  ): void {
    const decoratorClass = this.name;
    const existingDecorators =
      Reflect.getMetadata(SAOP_METADATA_KEY, target.constructor, propertyKey) || [];
    existingDecorators.push({
      type,
      options,
      decoratorClass,
    });
    Reflect.defineMetadata(SAOP_METADATA_KEY, existingDecorators, target.constructor, propertyKey);
  }

  /**
   * Static decorator method for around
   * @param options - Decorator options
   * @returns Decorator function
   */
  static around(this: new () => SAOPDecorator, options: SAOPOptions = {}) {
    return (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => {
      SAOPDecorator.addDecorator(AOP_TYPES.AROUND, options, target, propertyKey);
    };
  }

  static before(this: new () => SAOPDecorator, options: SAOPOptions = {}) {
    return (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => {
      SAOPDecorator.addDecorator(AOP_TYPES.BEFORE, options, target, propertyKey);
    };
  }

  static after(this: new () => SAOPDecorator, options: SAOPOptions = {}) {
    return (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => {
      SAOPDecorator.addDecorator(AOP_TYPES.AFTER, options, target, propertyKey);
    };
  }

  static afterReturning(this: new () => SAOPDecorator, options: SAOPOptions = {}) {
    return (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => {
      SAOPDecorator.addDecorator(AOP_TYPES.AFTER_RETURNING, options, target, propertyKey);
    };
  }

  static afterThrowing(this: new () => SAOPDecorator, options: SAOPOptions = {}) {
    return (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => {
      SAOPDecorator.addDecorator(AOP_TYPES.AFTER_THROWING, options, target, propertyKey);
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
