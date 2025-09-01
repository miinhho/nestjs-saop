import { Injectable } from '@nestjs/common';
import type { AOPMethodWithDecorators } from '../interfaces';
import { AOP_METADATA_KEY } from '../utils';

/**
 * Analyzes class instances to discover methods that have
 * AOP decorators applied.
 */
@Injectable()
export class MethodProcessor {
  /**
   * Analyzes a class instance to find all methods that have AOP decorators
   * applied.
   *
   * @param wrapper - InstanceWrapper containing the instance and metatype
   * @returns Array of methods with their associated AOP decorators
   */
  processInstanceMethods(wrapper: any): AOPMethodWithDecorators[] {
    if (!wrapper.instance || !wrapper.metatype) {
      return [];
    }

    const prototype = this.getPrototype(wrapper.metatype);
    if (!prototype) return [];

    const methodNames = this.getMethodNames(prototype);
    const methods: AOPMethodWithDecorators[] = [];

    for (const methodName of methodNames) {
      const decorators = this.getDecorators(wrapper.metatype, methodName);
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
   * Retrieves AOP decorator metadata for a specific method.
   *
   * @param metatype - The class constructor
   * @param methodName - The name of the method to check
   * @returns Array of decorator metadata if found, `undefined` otherwise
   */
  private getDecorators(metatype: any, methodName: string): any[] | undefined {
    return Reflect.getMetadata(AOP_METADATA_KEY, metatype, methodName);
  }
}
