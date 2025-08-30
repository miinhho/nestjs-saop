import { SAOP_METADATA_KEY } from '@/interfaces/saop-decorator.interface';
import { Injectable } from '@nestjs/common';

/**
 * Processes class methods and finds SAOP decorators
 */
@Injectable()
export class MethodProcessor {
  /**
   * Process instance methods and find SAOP decorators
   * @param wrapper - InstanceWrapper with instance and metatype
   * @returns Array of methods with SAOP decorators
   */
  processInstanceMethods(wrapper: any): Array<{ methodName: string; decorators: any[] }> {
    if (!wrapper.instance || !wrapper.metatype) {
      return [];
    }

    const prototype = this.getPrototype(wrapper.metatype);
    if (!prototype) {
      return [];
    }

    const methodNames = this.getMethodNames(prototype);
    const methods: Array<{ methodName: string; decorators: any[] }> = [];

    for (const methodName of methodNames) {
      const decorators = this.getDecorators(wrapper.metatype, methodName);
      if (decorators && decorators.length > 0) {
        methods.push({ methodName, decorators });
      }
    }

    return methods;
  }

  /**
   * Get prototype safely
   * @param metatype - Class constructor
   * @returns Valid prototype or null
   */
  private getPrototype(metatype: any) {
    try {
      const prototype = metatype.prototype;
      return prototype && typeof prototype === 'object' ? prototype : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get method names from prototype
   * @param prototype - Class prototype
   * @returns Array of method names
   */
  private getMethodNames(prototype: any): string[] {
    if (!prototype || typeof prototype !== 'object') {
      return [];
    }

    try {
      const propertyNames = Object.getOwnPropertyNames(prototype);
      return propertyNames.filter(name => {
        if (name === 'constructor') {
          return false;
        }

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
   * Get decorators from metadata
   * @param metatype - Class constructor
   * @param methodName - Method name
   * @returns Array of decorator metadata
   */
  private getDecorators(metatype: any, methodName: string): any[] | undefined {
    return Reflect.getMetadata(SAOP_METADATA_KEY, metatype, methodName);
  }
}
