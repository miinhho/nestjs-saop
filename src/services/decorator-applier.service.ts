import { Injectable } from '@nestjs/common';
import { AOP_TYPES, type IAOPDecorator } from '../interfaces';

/**
 * Applies AOP decorators to methods
 */
@Injectable()
export class DecoratorApplier {
  /**
   * Apply decorators to method
   * @param instance - Target instance
   * @param methodName - Method name
   * @param decorators - Decorator metadata array
   * @param aopDecorators - AOP decorator instances
   * @param originalMethod - Original method function
   */
  applyDecorators(
    instance: any,
    methodName: string,
    decorators: any[],
    aopDecorators: IAOPDecorator[],
    originalMethod: Function,
  ): void {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), methodName);
    if (!descriptor) {
      return;
    }

    for (const decorator of decorators) {
      if (!decorator.decoratorClass) {
        console.warn(
          `[nestjs-aop]: Decorator without decoratorClass found for method ${methodName}. Skipping.`,
        );
        continue;
      }

      const targetDecorator = aopDecorators.find(
        d => d.constructor.name === decorator.decoratorClass,
      );
      if (targetDecorator) {
        this.applySingleDecorator(targetDecorator, descriptor, instance, originalMethod, decorator);
      } else {
        console.warn(
          `[nestjs-aop]: No matching decorator instance found for ${decorator.decoratorClass} on method ${methodName}`,
        );
      }
    }

    Object.defineProperty(Object.getPrototypeOf(instance), methodName, descriptor);
  }

  /**
   * Apply single decorator
   * @param aopDecorator - AOP decorator instance
   * @param descriptor - Method descriptor
   * @param instance - Target instance
   * @param originalMethod - Original method
   * @param decorator - Decorator metadata
   */
  private applySingleDecorator(
    aopDecorator: IAOPDecorator,
    descriptor: PropertyDescriptor,
    instance: any,
    originalMethod: Function,
    decorator: any,
  ): void {
    switch (decorator.type) {
      case AOP_TYPES.BEFORE:
        this.applyBefore(aopDecorator, descriptor, instance, originalMethod, decorator.options);
        break;
      case AOP_TYPES.AFTER:
        this.applyAfter(aopDecorator, descriptor, instance, originalMethod, decorator.options);
        break;
      case AOP_TYPES.AFTER_RETURNING:
        this.applyAfterReturning(
          aopDecorator,
          descriptor,
          instance,
          originalMethod,
          decorator.options,
        );
        break;
      case AOP_TYPES.AFTER_THROWING:
        this.applyAfterThrowing(
          aopDecorator,
          descriptor,
          instance,
          originalMethod,
          decorator.options,
        );
        break;
      case AOP_TYPES.AROUND:
        this.applyAround(aopDecorator, descriptor, instance, originalMethod, decorator.options);
        break;
    }
  }

  /**
   * Apply around decorator
   * @param aopDecorator - AOP decorator
   * @param descriptor - Method descriptor
   * @param instance - Target instance
   * @param originalMethod - Original method
   * @param options - Decorator options
   */
  private applyAround(
    aopDecorator: IAOPDecorator,
    descriptor: PropertyDescriptor,
    instance: any,
    originalMethod: Function,
    options: any,
  ): void {
    if (aopDecorator.around) {
      const currentMethod = descriptor.value;
      descriptor.value = (...args: any[]) => {
        return aopDecorator.around!({ method: currentMethod, options })(...args);
      };
    }
  }

  /**
   * Apply before decorator
   * @param aopDecorator - AOP decorator
   * @param descriptor - Method descriptor
   * @param instance - Target instance
   * @param originalMethod - Original method
   * @param options - Decorator options
   */
  private applyBefore(
    aopDecorator: IAOPDecorator,
    descriptor: PropertyDescriptor,
    instance: any,
    originalMethod: Function,
    options: any,
  ): void {
    if (aopDecorator.before) {
      const currentMethod = descriptor.value;
      descriptor.value = (...args: any[]) => {
        aopDecorator.before!({ method: originalMethod, options })(...args);
        return currentMethod.apply(instance, args);
      };
    }
  }

  /**
   * Apply after decorator
   * @param aopDecorator - AOP decorator
   * @param descriptor - Method descriptor
   * @param instance - Target instance
   * @param originalMethod - Original method
   * @param options - Decorator options
   */
  private applyAfter(
    aopDecorator: IAOPDecorator,
    descriptor: PropertyDescriptor,
    instance: any,
    originalMethod: Function,
    options: any,
  ): void {
    if (aopDecorator.after) {
      const currentMethod = descriptor.value;
      descriptor.value = (...args: any[]) => {
        const result = currentMethod.apply(instance, args);
        aopDecorator.after!({ method: originalMethod, options })(...args);
        return result;
      };
    }
  }

  /**
   * Apply afterReturning decorator
   * @param aopDecorator - AOP decorator
   * @param descriptor - Method descriptor
   * @param instance - Target instance
   * @param originalMethod - Original method
   * @param options - Decorator options
   */
  private applyAfterReturning(
    aopDecorator: IAOPDecorator,
    descriptor: PropertyDescriptor,
    instance: any,
    originalMethod: Function,
    options: any,
  ): void {
    if (aopDecorator.afterReturning) {
      const currentMethod = descriptor.value;
      descriptor.value = (...args: any[]) => {
        const result = currentMethod.apply(instance, args);
        aopDecorator.afterReturning!({ method: originalMethod, options, result })(...args);
        return result;
      };
    }
  }

  /**
   * Apply afterThrowing decorator
   * @param aopDecorator - AOP decorator
   * @param descriptor - Method descriptor
   * @param instance - Target instance
   * @param originalMethod - Original method
   * @param options - Decorator options
   */
  private applyAfterThrowing(
    aopDecorator: IAOPDecorator,
    descriptor: PropertyDescriptor,
    instance: any,
    originalMethod: Function,
    options: any,
  ): void {
    if (aopDecorator.afterThrowing) {
      const currentMethod = descriptor.value;
      descriptor.value = (...args: any[]) => {
        try {
          return currentMethod.apply(instance, args);
        } catch (error) {
          aopDecorator.afterThrowing!({ method: originalMethod, options, error })(...args);
          throw error;
        }
      };
    }
  }
}
