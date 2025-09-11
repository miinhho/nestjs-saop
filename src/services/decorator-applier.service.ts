import { Injectable } from '@nestjs/common';
import {
  AOP_TYPES,
  AOPDecoratorMetadata,
  type AOPDecoratorContext,
  type IAOPDecorator,
} from '../interfaces';
import { logger } from '../utils';

/**
 * Service for applying AOP decorators to methods
 *
 * This service is for taking AOP decorator metadata and applying
 * the corresponding advice to target methods at runtime.
 *
 * It handles the transformation of method descriptors to include AOP behavior.
 *
 * @internal
 */
@Injectable()
export class DecoratorApplier {
  /**
   * Processes an array of decorator metadata and applies each corresponding
   * AOP advice to the target method.
   *
   * @param instance - The instance of the class containing the target method
   * @param methodName - The name of the method to decorate
   * @param decorators - Array of decorator metadata objects
   * @param aopDecorators - Array of AOP decorator instances available for application
   * @param originalMethod - The original method function before decoration
   */
  applyDecorators({
    instance,
    methodName,
    decorators,
    aopDecorators,
    originalMethod,
  }: {
    instance: any;
    methodName: string;
    decorators: AOPDecoratorMetadata[];
    aopDecorators: IAOPDecorator[];
    originalMethod: Function;
  }) {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), methodName);
    if (!descriptor) return;

    // To handle decorator order correctly, we sort in descending order
    // so that higher order decorators are applied first.
    const sortedDecorators = decorators.sort((a, b) => b.order - a.order);
    for (const decorator of sortedDecorators) {
      if (!decorator.decoratorClass) {
        logger.warn(`Decorator without decoratorClass found for method ${methodName}. Skipping.`);
        continue;
      }

      const targetDecorator = aopDecorators.find(
        d => d.constructor.name === decorator.decoratorClass.name,
      );
      if (targetDecorator) {
        this.applySingleDecorator({
          aopDecorator: targetDecorator,
          descriptor,
          instance,
          originalMethod,
          decorator,
        });
      } else {
        logger.warn(
          `No matching decorator instance found for ${decorator.decoratorClass} on method ${methodName}`,
        );
      }
    }

    Object.defineProperty(Object.getPrototypeOf(instance), methodName, descriptor);
  }

  /**
   * Applies a single AOP decorator to the method based on its type.
   *
   * This method routes the decorator application to the appropriate
   * handler method for the specific AOP advice type.
   *
   * @param aopDecorator - The AOP decorator instance to apply
   * @param descriptor - The property descriptor of the target method
   * @param instance - The instance of the class containing the method
   * @param originalMethod - The original method function
   * @param decorator - The metadata for the decorator being applied
   */
  private applySingleDecorator({
    aopDecorator,
    descriptor,
    instance,
    originalMethod,
    decorator,
  }: Omit<AOPDecoratorContext, 'options'> & {
    decorator: AOPDecoratorMetadata;
  }) {
    const decoratorContext = {
      aopDecorator,
      descriptor,
      instance,
      originalMethod,
      options: decorator.options,
    };
    switch (decorator.type) {
      case AOP_TYPES.BEFORE:
        this.applyBefore(decoratorContext);
        break;
      case AOP_TYPES.AFTER:
        this.applyAfter(decoratorContext);
        break;
      case AOP_TYPES.AFTER_RETURNING:
        this.applyAfterReturning(decoratorContext);
        break;
      case AOP_TYPES.AFTER_THROWING:
        this.applyAfterThrowing(decoratorContext);
        break;
      case AOP_TYPES.AROUND:
        this.applyAround(decoratorContext);
        break;
    }
  }

  /**
   * Applies around advice to the method, which completely wraps the
   * method execution.
   *
   * @param aopDecorator - The AOP decorator instance with around advice
   * @param descriptor - The property descriptor of the target method
   * @param options - Configuration options for the decorator
   */
  private applyAround({ aopDecorator, descriptor, options }: AOPDecoratorContext) {
    if (aopDecorator.around) {
      const currentMethod = descriptor.value;
      descriptor.value = (...args: any[]) => {
        return aopDecorator.around!({ method: currentMethod, options })(...args);
      };
    }
  }

  /**
   * Applies before advice to the method, which executes before the
   * original method.
   *
   * @param aopDecorator - The AOP decorator instance with before advice
   * @param descriptor - The property descriptor of the target method
   * @param instance - The instance of the class containing the method
   * @param originalMethod - The original method function
   * @param options - Configuration options for the decorator
   */
  private applyBefore({
    aopDecorator,
    descriptor,
    instance,
    originalMethod,
    options,
  }: AOPDecoratorContext) {
    if (aopDecorator.before) {
      const currentMethod = descriptor.value;
      descriptor.value = (...args: any[]) => {
        aopDecorator.before!({ method: originalMethod, options })(...args);
        return currentMethod.apply(instance, args);
      };
    }
  }

  /**
   * Applies after advice to the method, which executes after the
   * original method completes, regardless of success or failure.
   *
   * @param aopDecorator - The AOP decorator instance with after advice
   * @param descriptor - The property descriptor of the target method
   * @param instance - The instance of the class containing the method
   * @param originalMethod - The original method function
   * @param options - Configuration options for the decorator
   */
  private applyAfter({
    aopDecorator,
    descriptor,
    instance,
    originalMethod,
    options,
  }: AOPDecoratorContext) {
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
   * Applies after-returning advice to the method, which executes only
   * when the original method completes successfully.
   *
   * @param aopDecorator - The AOP decorator instance with after-returning advice
   * @param descriptor - The property descriptor of the target method
   * @param instance - The instance of the class containing the method
   * @param originalMethod - The original method function
   * @param options - Configuration options for the decorator
   */
  private applyAfterReturning({
    aopDecorator,
    descriptor,
    instance,
    originalMethod,
    options,
  }: AOPDecoratorContext) {
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
   * Applies after-throwing advice to the method, which executes only
   * when the original method throws an exception.
   *
   * @param aopDecorator - The AOP decorator instance with after-throwing advice
   * @param descriptor - The property descriptor of the target method
   * @param instance - The instance of the class containing the method
   * @param originalMethod - The original method function
   * @param options - Configuration options for the decorator
   */
  private applyAfterThrowing({
    aopDecorator,
    descriptor,
    instance,
    originalMethod,
    options,
  }: AOPDecoratorContext) {
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
