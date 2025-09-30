import { Injectable } from '@nestjs/common';
import { AOP_ORDER_METADATA_KEY } from '../decorators';
import { AOPError } from '../error';
import type { AOPDecoratorMetadata, AOPMethodWithDecorators } from '../interfaces';
import { AOP_METADATA_KEY, resolveMetatype } from '../utils';

interface MethodCache {
  methods: AOPMethodWithDecorators[];
  metatype: Function | null;
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

  private readonly enableStats: boolean;
  private cacheStats = {
    hits: 0,
    misses: 0,
  };

  constructor() {
    // Disable stats in production for performance
    this.enableStats = process.env.NODE_ENV !== 'production';
  }

  /**
   * Analyzes a class instance to find all methods that have AOP decorators
   * applied.
   *
   * @param wrapper - InstanceWrapper containing the instance and metatype
   *
   * @returns Array of methods with their associated AOP decorators
   */
  processInstanceMethods(wrapper: any): MethodCache {
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
      if (this.enableStats) this.cacheStats.hits++;
      return cached;
    }

    // Cache miss: process methods
    if (this.enableStats) this.cacheStats.misses++;
    const methods = this.processMethodsInternal(metatype);

    const result = {
      methods,
      metatype,
    };

    this.classCache.set(metatype, result);

    return result;
  }

  /**
   * Internal method processing logic (extracted for caching)
   */
  private processMethodsInternal(metatype: Function): AOPMethodWithDecorators[] {
    const prototype = this.getPrototype(metatype);
    if (!prototype) return [];

    const methodNames = this.getMethodNames(prototype);
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
  private getPrototype(metatype: any): object | null {
    try {
      const prototype = metatype.prototype;
      return prototype && typeof prototype === 'object' ? prototype : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extracts all method names from a class prototype, filtering out
   * the constructor and non-function properties.
   *
   * @param prototype - The class prototype to analyze
   *
   * @returns Array of method names found in the prototype
   */
  private getMethodNames(prototype: any): string[] {
    if (!prototype || typeof prototype !== 'object') {
      return [];
    }

    try {
      const propertyNames = Object.getOwnPropertyNames(prototype);
      return propertyNames.filter(name => {
        if (name === 'constructor') return false;

        try {
          return typeof prototype[name] === 'function';
        } catch {
          return false;
        }
      });
    } catch {
      return [];
    }
  }

  /**
   * Retrieves AOP decorator metadata for a specific method and adds order information.
   *
   * @param metatype - The class constructor
   * @param methodName - The name of the method to check
   *
   * @returns Array of decorator metadata if found, `undefined` otherwise
   */
  private getDecorators(metatype: any, methodName: string): any[] | undefined {
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
    metatype: any,
    methodName: string,
  ): AOPDecoratorMetadata[] | undefined {
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

  /**
   * Clears all caches. Useful for testing or when runtime metadata changes are expected.
   * Note: WeakMap entries will be automatically garbage collected when their keys are no longer referenced.
   */
  clearCaches(): void {
    this.classCache = new WeakMap();
    if (this.enableStats) {
      this.cacheStats = { hits: 0, misses: 0 };
    }
  }

  /**
   * Gets cache statistics for monitoring and debugging.
   *
   * Returns empty stats if monitoring is disabled.
   */
  getCacheStats() {
    if (!this.enableStats) {
      return {
        hits: 0,
        misses: 0,
        enabled: false,
      };
    }

    return {
      ...this.cacheStats,
      enabled: true,
    };
  }

  /**
   * Gets cache hit rate as a percentage.
   *
   * @returns Hit rate percentage (0-100) or 0 if stats disabled
   */
  getCacheHitRate(): number {
    if (!this.enableStats) return 0;

    const totalAccess = this.cacheStats.hits + this.cacheStats.misses;
    return totalAccess > 0 ? (this.cacheStats.hits / totalAccess) * 100 : 0;
  }
}
