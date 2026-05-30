import { Injectable } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { AOP_ORDER_METADATA_KEY } from '../decorators';
import { AOPError } from '../error';
import type { AOPDecoratorMetadata, AOPMethodWithDecorators } from '../interfaces';
import { AOP_METADATA_KEY, getAllMethods, resolveMetatype } from '../utils';

interface MethodCache {
  methods: AOPMethodWithDecorators[];
  metatype: InstanceWrapper['metatype'] | null;
}

/**
 * Analyzes class instances to discover methods that have
 * AOP decorators applied.
 *
 * @internal
 */
@Injectable()
export class MethodProcessor {
  private classCache = new WeakMap<Function, MethodCache>();

  /**
   * Analyzes a class instance to find all methods that have AOP decorators
   * applied. Results are cached per class constructor.
   *
   * @param wrapper - InstanceWrapper containing the instance and metatype
   *
   * @returns Array of methods with their associated AOP decorators
   */
  processInstanceMethods(wrapper: InstanceWrapper): MethodCache {
    if (!wrapper?.instance) {
      return { methods: [], metatype: null };
    }

    // For factory providers, use the instance's constructor instead of metatype
    const metatype = resolveMetatype(wrapper);
    if (!metatype) {
      return { methods: [], metatype: null };
    }

    const cached = this.classCache.get(metatype);
    if (cached) {
      return cached;
    }

    const methods = this.processMethodsInternal(metatype);
    const result = { methods, metatype };
    this.classCache.set(metatype, result);

    return result;
  }

  /**
   * Internal method processing logic (extracted for caching)
   */
  private processMethodsInternal(metatype: InstanceWrapper['metatype']): AOPMethodWithDecorators[] {
    const prototype = this.getPrototype(metatype);
    if (!prototype) return [];

    const methodNames = getAllMethods(prototype);
    const methods: AOPMethodWithDecorators[] = [];

    for (const methodName of methodNames) {
      const decorators = this.getDecorators(metatype, methodName);
      if (decorators && decorators.length > 0) {
        methods.push({ methodName, decorators });
      }
    }

    return methods;
  }

  /**
   * Safely retrieves the prototype of a class constructor.
   *
   * @param metatype - The class constructor
   *
   * @returns The class prototype if valid, `null` otherwise
   */
  private getPrototype(metatype: InstanceWrapper['metatype']): object | null {
    if (!metatype || typeof metatype !== 'function' || !metatype.prototype) {
      return null;
    }

    const prototype = metatype.prototype;
    return typeof prototype === 'object' ? prototype : null;
  }

  /**
   * Retrieves AOP decorator metadata for a specific method and adds order information.
   *
   * @param metatype - The class constructor
   * @param methodName - The name of the method to check
   *
   * @returns Array of decorator metadata if found, `undefined` otherwise
   */
  private getDecorators(
    metatype: InstanceWrapper['metatype'],
    methodName: string,
  ): any[] | undefined {
    const decorators = this.getAspectDecorator(metatype, methodName);
    if (!decorators || decorators.length === 0) {
      return undefined;
    }

    const decoratorsWithOrder = decorators.map(decorator => {
      const order = this.getAspectOrderDecorator(decorator);
      return { ...decorator, order };
    });

    return decoratorsWithOrder;
  }

  /**
   * Retrieves AOP decorator metadata for a specific method.
   *
   * @param metatype - The class constructor
   * @param methodName - The name of the method to check
   *
   * @returns Array of decorator metadata if found, `undefined` otherwise
   */
  private getAspectDecorator(
    metatype: InstanceWrapper['metatype'],
    methodName: string,
  ): AOPDecoratorMetadata[] | undefined {
    // InstanceWrapper['metatype'] can be null, so we check here to avoid errors.
    if (!metatype) return undefined;

    return Reflect.getMetadata(AOP_METADATA_KEY, metatype, methodName);
  }

  /**
   * Retrieves AOP order metadata for a given decorator.
   *
   * @param decorator - The decorator metadata
   *
   * @returns The order number for the decorator
   *
   * @throws AOPError if order metadata is not found
   */
  private getAspectOrderDecorator(decorator: AOPDecoratorMetadata): number {
    const order = Reflect.getMetadata(AOP_ORDER_METADATA_KEY, decorator.decoratorClass);
    if (order === undefined) {
      throw new AOPError(
        `Order metadata not found for decorator ${decorator.decoratorClass.name}. ` +
          `This should not happen as Aspect decorator provides default order.`,
      );
    }
    if (typeof order !== 'number') {
      throw new AOPError(
        `Order metadata for decorator ${decorator.decoratorClass.name} is not a number. ` +
          `Expected number, but got ${typeof order}: ${order}`,
      );
    }

    return order;
  }
}
