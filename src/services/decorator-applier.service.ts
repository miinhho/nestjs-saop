import type { ISAOPDecorator } from '@/interfaces/saop-decorator.interface';
import { AOP_TYPES } from '@/interfaces/saop-decorator.interface';
import { Injectable } from '@nestjs/common';

/**
 * Applies SAOP decorators to methods
 */
@Injectable()
export class DecoratorApplier {
  /**
   * Apply decorators to method
   * @param instance - Target instance
   * @param methodName - Method name
   * @param decorators - Decorator metadata array
   * @param saopDecorators - SAOP decorator instances
   * @param originalMethod - Original method function
   */
  applyDecorators(
    instance: any,
    methodName: string,
    decorators: any[],
    saopDecorators: ISAOPDecorator[],
    originalMethod: Function,
  ): void {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), methodName);
    if (!descriptor) {
      return;
    }

    for (const decorator of decorators) {
      if (decorator.decoratorClass) {
        const targetDecorator = saopDecorators.find(
          d => d.constructor.name === decorator.decoratorClass,
        );
        if (targetDecorator) {
          this.applySingleDecorator(
            targetDecorator,
            descriptor,
            instance,
            originalMethod,
            decorator,
          );
        }
      } else {
        for (const saopDecorator of saopDecorators) {
          this.applySingleDecorator(saopDecorator, descriptor, instance, originalMethod, decorator);
        }
      }
    }

    Object.defineProperty(Object.getPrototypeOf(instance), methodName, descriptor);
  }

  /**
   * Apply single decorator
   * @param saopDecorator - SAOP decorator instance
   * @param descriptor - Method descriptor
   * @param instance - Target instance
   * @param originalMethod - Original method
   * @param decorator - Decorator metadata
   */
  private applySingleDecorator(
    saopDecorator: ISAOPDecorator,
    descriptor: PropertyDescriptor,
    instance: any,
    originalMethod: Function,
    decorator: any,
  ): void {
    switch (decorator.type) {
      case AOP_TYPES.AROUND:
        this.applyAround(saopDecorator, descriptor, originalMethod, decorator.options);
        break;
      case AOP_TYPES.BEFORE:
        this.applyBefore(saopDecorator, descriptor, instance, originalMethod, decorator.options);
        break;
      case AOP_TYPES.AFTER:
        this.applyAfter(saopDecorator, descriptor, instance, originalMethod, decorator.options);
        break;
      case AOP_TYPES.AFTER_RETURNING:
        this.applyAfterReturning(
          saopDecorator,
          descriptor,
          instance,
          originalMethod,
          decorator.options,
        );
        break;
      case AOP_TYPES.AFTER_THROWING:
        this.applyAfterThrowing(
          saopDecorator,
          descriptor,
          instance,
          originalMethod,
          decorator.options,
        );
        break;
    }
  }

  /**
   * Apply around decorator
   * @param saopDecorator - SAOP decorator
   * @param descriptor - Method descriptor
   * @param originalMethod - Original method
   * @param options - Decorator options
   */
  private applyAround(
    saopDecorator: ISAOPDecorator,
    descriptor: PropertyDescriptor,
    originalMethod: Function,
    options: any,
  ): void {
    if (saopDecorator.around) {
      descriptor.value = saopDecorator.around({ method: originalMethod, options });
    }
  }

  /**
   * Apply before decorator
   * @param saopDecorator - SAOP decorator
   * @param descriptor - Method descriptor
   * @param instance - Target instance
   * @param originalMethod - Original method
   * @param options - Decorator options
   */
  private applyBefore(
    saopDecorator: ISAOPDecorator,
    descriptor: PropertyDescriptor,
    instance: any,
    originalMethod: Function,
    options: any,
  ): void {
    if (saopDecorator.before) {
      const original = descriptor.value;
      descriptor.value = (...args: any[]) => {
        saopDecorator.before!({ method: originalMethod, options })(...args);
        return original.apply(instance, args);
      };
    }
  }

  /**
   * Apply after decorator
   * @param saopDecorator - SAOP decorator
   * @param descriptor - Method descriptor
   * @param instance - Target instance
   * @param originalMethod - Original method
   * @param options - Decorator options
   */
  private applyAfter(
    saopDecorator: ISAOPDecorator,
    descriptor: PropertyDescriptor,
    instance: any,
    originalMethod: Function,
    options: any,
  ): void {
    if (saopDecorator.after) {
      const original = descriptor.value;
      descriptor.value = (...args: any[]) => {
        const result = original.apply(instance, args);
        saopDecorator.after!({ method: originalMethod, options })(...args);
        return result;
      };
    }
  }

  /**
   * Apply afterReturning decorator
   * @param saopDecorator - SAOP decorator
   * @param descriptor - Method descriptor
   * @param instance - Target instance
   * @param originalMethod - Original method
   * @param options - Decorator options
   */
  private applyAfterReturning(
    saopDecorator: ISAOPDecorator,
    descriptor: PropertyDescriptor,
    instance: any,
    originalMethod: Function,
    options: any,
  ): void {
    if (saopDecorator.afterReturning) {
      const original = descriptor.value;
      descriptor.value = (...args: any[]) => {
        const result = original.apply(instance, args);
        saopDecorator.afterReturning!({ method: originalMethod, options, result })(...args);
        return result;
      };
    }
  }

  /**
   * Apply afterThrowing decorator
   * @param saopDecorator - SAOP decorator
   * @param descriptor - Method descriptor
   * @param instance - Target instance
   * @param originalMethod - Original method
   * @param options - Decorator options
   */
  private applyAfterThrowing(
    saopDecorator: ISAOPDecorator,
    descriptor: PropertyDescriptor,
    instance: any,
    originalMethod: Function,
    options: any,
  ): void {
    if (saopDecorator.afterThrowing) {
      const original = descriptor.value;
      descriptor.value = (...args: any[]) => {
        try {
          return original.apply(instance, args);
        } catch (error) {
          saopDecorator.afterThrowing!({ method: originalMethod, options, error })(...args);
          throw error;
        }
      };
    }
  }
}
