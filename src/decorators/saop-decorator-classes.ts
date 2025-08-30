import { Injectable } from '@nestjs/common';
import type {
  AOPType,
  ErrorAOPContext,
  ISAOPDecorator,
  ResultAOPContext,
  SAOPOptions,
  UnitAOPContext,
} from '../interfaces';
import { AOP_TYPES, SAOP_METADATA_KEY } from '../interfaces';

/**
 * Base class for SAOP decorators
 * @template T - Method return type
 * @template E - Error type
 */
@Injectable()
export abstract class SAOPDecorator<T = unknown, E = unknown> implements ISAOPDecorator<T, E> {
  private static addDecorator({
    decoratorClass,
    target,
    propertyKey,
    options = {},
    type,
  }: {
    decoratorClass: string;
    target: any;
    propertyKey: string;
    options: SAOPOptions;
    type: AOPType;
  }): void {
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
      const decoratorClass = this.name;
      SAOPDecorator.addDecorator({
        decoratorClass,
        target,
        propertyKey,
        options,
        type: AOP_TYPES.AROUND,
      });
    };
  }

  static before(this: new () => SAOPDecorator, options: SAOPOptions = {}) {
    return (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => {
      const decoratorClass = this.name;
      SAOPDecorator.addDecorator({
        decoratorClass,
        target,
        propertyKey,
        options,
        type: AOP_TYPES.BEFORE,
      });
    };
  }

  static after(this: new () => SAOPDecorator, options: SAOPOptions = {}) {
    return (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => {
      const decoratorClass = this.name;
      SAOPDecorator.addDecorator({
        decoratorClass,
        target,
        propertyKey,
        options,
        type: AOP_TYPES.AFTER,
      });
    };
  }

  static afterReturning(this: new () => SAOPDecorator, options: SAOPOptions = {}) {
    return (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => {
      const decoratorClass = this.name;
      SAOPDecorator.addDecorator({
        decoratorClass,
        target,
        propertyKey,
        options,
        type: AOP_TYPES.AFTER_RETURNING,
      });
    };
  }

  static afterThrowing(this: new () => SAOPDecorator, options: SAOPOptions = {}) {
    return (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => {
      const decoratorClass = this.name;
      SAOPDecorator.addDecorator({
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
  around?(context: UnitAOPContext<T, E>): (...args: any[]) => T;

  /**
   * Before decorator (optional implementation)
   * @param context - Method and options context
   * @returns Callback function
   */
  before?(context: UnitAOPContext<T, E>): (...args: any[]) => void;

  /**
   * After decorator (optional implementation)
   * @param context - Method and options context
   * @returns Callback function
   */
  after?(context: UnitAOPContext<T, E>): (...args: any[]) => void;

  /**
   * AfterReturning decorator (optional implementation)
   * @param context - Method, options, and result context
   * @returns Callback function
   */
  afterReturning?(context: ResultAOPContext<T, E>): (...args: any[]) => void;

  /**
   * AfterThrowing decorator (optional implementation)
   * @param context - Method, options, and error context
   * @returns Callback function
   */
  afterThrowing?(context: ErrorAOPContext<T, E>): (...args: any[]) => void;
}
