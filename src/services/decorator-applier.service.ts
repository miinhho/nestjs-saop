import { Injectable } from '@nestjs/common';
import {
  AOP_TYPES,
  AOPDecoratorMetadataWithOrder,
  AOPType,
  type IAOPDecorator,
} from '../interfaces';
import { logger } from '../utils';

/**
 * Type definition for chains of AOP advice functions.
 * @internal
 */
type ChainFunctions = Record<AOPType, Function | undefined>;

/**
 * Parameters for applying AOP decorators to a method.
 * @internal
 */
type DecoratorApplierParams = {
  instance: any;
} & ChainCreationParams;

/**
 * Parameters for creating a chain of AOP advice functions.
 * @internal
 */
type ChainCreationParams = {
  decorators: AOPDecoratorMetadataWithOrder[];
  aopDecorators: IAOPDecorator[];
  originalMethod: Function;
  methodName: string;
};

/**
 * Parameters for searching a target AOP decorator instance.
 * @internal
 */
type DecoratorSearchParams = {
  decorator: AOPDecoratorMetadataWithOrder;
  aopDecorators: IAOPDecorator[];
  methodName: string;
};

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
  private static readonly AOP_PROTOTYPE_APPLIED_SYMBOL = Symbol('aop:prototype:applied');

  /**
   * Checks if a method has already been processed to avoid duplicate AOP application.
   *
   * Uses both instance-level and prototype-level tracking for comprehensive duplicate prevention.
   */
  private isMethodProcessed(instance: any, methodName: string): boolean {
    const prototype = Object.getPrototypeOf(instance);
    const prototypeAppliedMethods = prototype[DecoratorApplier.AOP_PROTOTYPE_APPLIED_SYMBOL];

    // Check if we have tracking and this specific method is tracked
    if (prototypeAppliedMethods?.has(methodName)) {
      // Double-check by examining the actual method descriptor
      const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
      if (descriptor?.value?.name === 'combinedAOPMethod') {
        return true;
      }
      // If tracking exists but method isn't actually wrapped, clear the tracking
      prototypeAppliedMethods.delete(methodName);
    }

    return false;
  }

  /**
   * Marks a method as processed to prevent duplicate AOP application.
   *
   * Uses prototype-level tracking for robust duplicate prevention.
   */
  private markMethodAsProcessed(instance: any, methodName: string): void {
    const prototype = Object.getPrototypeOf(instance);

    // Mark at prototype level (primary tracking)
    if (!prototype[DecoratorApplier.AOP_PROTOTYPE_APPLIED_SYMBOL]) {
      prototype[DecoratorApplier.AOP_PROTOTYPE_APPLIED_SYMBOL] = new Set<string>();
    }
    prototype[DecoratorApplier.AOP_PROTOTYPE_APPLIED_SYMBOL].add(methodName);
  }

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
  }: DecoratorApplierParams) {
    const prototype = Object.getPrototypeOf(instance);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);

    if (!descriptor || !descriptor.configurable) {
      return;
    }

    // Prevent duplicate processing of the same method
    if (this.isMethodProcessed(instance, methodName)) {
      return;
    }

    // To handle decorator order correctly, we sort in ascending order
    // so that lower order decorators are applied first (outermost in the chain).
    const sortedDecorators = decorators.sort((a, b) => a.order - b.order);

    const decoratorsByType: Record<string, typeof sortedDecorators> = {};
    for (const decorator of sortedDecorators) {
      const type = decorator.type;
      if (!decoratorsByType[type]) {
        decoratorsByType[type] = [];
      }
      decoratorsByType[type].push(decorator);
    }

    const chains = this.createAllChains({
      decoratorsByType,
      aopDecorators,
      originalMethod,
      methodName,
    });

    // Create a named function for better debugging and duplicate detection
    const combinedMethod = this.combineChains({ chains, originalMethod, instance });

    descriptor.value = combinedMethod;
    Object.defineProperty(prototype, methodName, descriptor);

    // Mark method as processed to prevent future duplicate processing
    this.markMethodAsProcessed(instance, methodName);
  }

  /**
   * Finds the target AOP decorator instance for a given decorator metadata.
   *
   * @param params.decorator - The decorator metadata to find
   * @param params.aopDecorators - The list of available AOP decorator instances
   * @param params.methodName - The name of the method being processed
   *
   * @returns The target decorator instance or null if not found
   */
  private findTargetDecorator({
    decorator,
    aopDecorators,
    methodName,
  }: DecoratorSearchParams): IAOPDecorator | null {
    if (!decorator.decoratorClass) {
      logger.warn(`Decorator without decoratorClass found for method ${methodName}. Skipping.`);
      return null;
    }

    const targetDecorator = aopDecorators.find(d => d.constructor === decorator.decoratorClass);
    if (!targetDecorator) {
      logger.warn(
        `No matching decorator instance found for ${decorator.decoratorClass} on method ${methodName}`,
      );
      return null;
    }

    return targetDecorator;
  }

  /**
   * Creates chains for all decorator types using Spring AOP execution order.
   *
   * AOP order: Around wraps the entire execution flow including Before/After advice.
   *
   * @param params.decoratorsByType - Record of decorator types to their corresponding metadata arrays
   * @param params.aopDecorators - The list of available AOP decorator instances
   * @param params.originalMethod - The original method function
   * @param params.methodName - The name of the method being processed
   *
   * @returns An object mapping each AOP type to its corresponding chain function
   */
  private createAllChains({
    decoratorsByType,
    aopDecorators,
    originalMethod,
    methodName,
  }: {
    decoratorsByType: Record<string, AOPDecoratorMetadataWithOrder[]>;
  } & Omit<ChainCreationParams, 'decorators'>): ChainFunctions {
    // Create core execution method that includes Before/After advice around the original method
    const coreExecution = this.createCoreExecution({
      decoratorsByType,
      aopDecorators,
      originalMethod,
      methodName,
    });

    // If Around decorators exist, wrap the core execution
    const aroundDecorators = decoratorsByType[AOP_TYPES.AROUND];
    const finalExecution =
      (aroundDecorators?.length ?? 0) > 0
        ? aroundDecorators!.reduceRight((nextMethod, decorator) => {
            const targetDecorator = this.findTargetDecorator({
              decorator,
              aopDecorators,
              methodName,
            });
            if (targetDecorator?.around) {
              const aroundWrapper = targetDecorator.around({
                method: nextMethod,
                options: decorator.options,
              });
              return (...args: any[]) => aroundWrapper(...args);
            }
            return nextMethod;
          }, coreExecution)
        : coreExecution;

    return {
      [AOP_TYPES.AROUND]: finalExecution,
      [AOP_TYPES.BEFORE]: undefined,
      [AOP_TYPES.AFTER]: undefined,
      [AOP_TYPES.AFTER_RETURNING]: undefined,
      [AOP_TYPES.AFTER_THROWING]: undefined,
    };
  }

  /**
   * Creates the core execution function that wraps the original method with Before/After advice.
   */
  private createCoreExecution({
    decoratorsByType,
    aopDecorators,
    originalMethod,
    methodName,
  }: {
    decoratorsByType: Record<string, AOPDecoratorMetadataWithOrder[]>;
  } & Omit<ChainCreationParams, 'decorators'>): Function {
    const beforeDecorators = decoratorsByType[AOP_TYPES.BEFORE] ?? [];
    const afterDecorators = decoratorsByType[AOP_TYPES.AFTER] ?? [];
    const afterReturningDecorators = decoratorsByType[AOP_TYPES.AFTER_RETURNING] ?? [];
    const afterThrowingDecorators = decoratorsByType[AOP_TYPES.AFTER_THROWING] ?? [];

    return (...args: any[]) => {
      // Execute Before advice
      for (const decorator of beforeDecorators) {
        const targetDecorator = this.findTargetDecorator({ decorator, aopDecorators, methodName });
        if (targetDecorator?.before) {
          targetDecorator.before({
            method: originalMethod,
            options: decorator.options,
          })(...args);
        }
      }

      let result: any;
      try {
        // Execute original method
        result = originalMethod.apply(this, args);

        // Execute AfterReturning advice
        for (const decorator of afterReturningDecorators) {
          const targetDecorator = this.findTargetDecorator({
            decorator,
            aopDecorators,
            methodName,
          });
          if (targetDecorator?.afterReturning) {
            const adviceFunction = targetDecorator.afterReturning({
              method: originalMethod,
              options: decorator.options,
              result,
            });
            if (typeof adviceFunction === 'function') {
              adviceFunction(...args);
            }
          }
        }

        return result;
      } catch (error) {
        // Execute AfterThrowing advice
        for (const decorator of afterThrowingDecorators) {
          const targetDecorator = this.findTargetDecorator({
            decorator,
            aopDecorators,
            methodName,
          });
          if (targetDecorator?.afterThrowing) {
            const adviceFunction = targetDecorator.afterThrowing({
              method: originalMethod,
              options: decorator.options,
              error,
            });
            if (typeof adviceFunction === 'function') {
              adviceFunction(...args);
            }
          }
        }
        throw error;
      } finally {
        // Execute After advice
        for (const decorator of afterDecorators) {
          const targetDecorator = this.findTargetDecorator({
            decorator,
            aopDecorators,
            methodName,
          });
          if (targetDecorator?.after) {
            targetDecorator.after({
              method: originalMethod,
              options: decorator.options,
            })(...args);
          }
        }
      }
    };
  }

  /**
   * Combines all chains into a single method using Spring AOP execution order.
   *
   * The chains object now contains only the final execution function that includes
   * all advice properly ordered: Around wraps (Before -> Method -> AfterReturning/AfterThrowing -> After).
   *
   * @param params.chains - The chains to combine (now simplified)
   * @param params.originalMethod - The original method function
   * @param params.instance - The instance of the class containing the method
   *
   * @returns A new function that combines all AOP advice and the original method
   */
  private combineChains({
    chains,
    originalMethod,
    instance,
  }: {
    chains: ChainFunctions;
    originalMethod: Function;
    instance: any;
  }): Function {
    return function combinedAOPMethod(...args: any[]) {
      // Around wraps everything, or execute core if no Around
      const finalExecution = chains[AOP_TYPES.AROUND];
      return finalExecution
        ? finalExecution.call(instance, ...args)
        : originalMethod.apply(instance, args);
    };
  }
}
