import { Injectable } from '@nestjs/common';
import {
  AOP_TYPES,
  AOPDecoratorMetadataWithOrder,
  AOPType,
  type IAOPDecorator,
} from '../interfaces';
import { logger } from '../utils';

type ChainFunctions = Record<AOPType, Function | undefined>;

type DecoratorApplierParams = {
  instance: any;
} & ChainCreationParams;

type ChainCreationParams = {
  decorators: AOPDecoratorMetadataWithOrder[];
  aopDecorators: IAOPDecorator[];
  originalMethod: Function;
  methodName: string;
};

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
  private static readonly AOP_APPLIED_SYMBOL = Symbol('aop:applied');

  /**
   * Checks if a method has already been processed to avoid duplicate AOP application.
   */
  private isMethodProcessed(instance: any, methodName: string): boolean {
    const appliedMethods = instance[DecoratorApplier.AOP_APPLIED_SYMBOL];
    return appliedMethods?.has(methodName) || false;
  }

  /**
   * Marks a method as processed to prevent duplicate AOP application.
   */
  private markMethodAsProcessed(instance: any, methodName: string): void {
    if (!instance[DecoratorApplier.AOP_APPLIED_SYMBOL]) {
      instance[DecoratorApplier.AOP_APPLIED_SYMBOL] = new Set<string>();
    }
    instance[DecoratorApplier.AOP_APPLIED_SYMBOL].add(methodName);
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
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), methodName);
    if (!descriptor) return;

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

    descriptor.value = this.combineChains({ chains, originalMethod, instance });

    Object.defineProperty(Object.getPrototypeOf(instance), methodName, descriptor);

    // Mark method as processed to prevent future duplicate processing
    this.markMethodAsProcessed(instance, methodName);
  }

  /**
   * Finds the target AOP decorator instance for a given decorator metadata.
   *
   * @param params.decorator - The decorator metadata to find
   * @param params.aopDecorators - The list of available AOP decorator instances
   * @param params.methodName - The name of the method being processed
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
   * Creates chains for all decorator types.
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
    const chains: ChainFunctions = {
      [AOP_TYPES.AROUND]: undefined,
      [AOP_TYPES.BEFORE]: undefined,
      [AOP_TYPES.AFTER]: undefined,
      [AOP_TYPES.AFTER_RETURNING]: undefined,
      [AOP_TYPES.AFTER_THROWING]: undefined,
    };

    for (const [type, decorators] of Object.entries(decoratorsByType)) {
      if (!decorators || decorators.length === 0) continue;

      const chainParams: ChainCreationParams = {
        decorators,
        aopDecorators,
        originalMethod,
        methodName,
      };

      switch (type) {
        case AOP_TYPES.AROUND:
          chains[type] = this.createAroundChain(chainParams);
          break;
        case AOP_TYPES.BEFORE:
          chains[type] = this.createBeforeChain(chainParams);
          break;
        case AOP_TYPES.AFTER:
          chains[type] = this.createAfterChain(chainParams);
          break;
        case AOP_TYPES.AFTER_RETURNING:
          chains[type] = this.createAfterReturningChain(chainParams);
          break;
        case AOP_TYPES.AFTER_THROWING:
          chains[type] = this.createAfterThrowingChain(chainParams);
          break;
      }
    }

    return chains;
  }

  /**
   * Combines all chains into a single method.
   *
   * @param params.chains - The chains to combine
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
    return (...args: any[]) => {
      const beforeChain = chains[AOP_TYPES.BEFORE];
      if (beforeChain) {
        beforeChain(...args);
      }

      let result: any;
      try {
        const aroundChain = chains[AOP_TYPES.AROUND];
        if (aroundChain) {
          result = aroundChain(...args);
        } else {
          result = originalMethod.apply(instance, args);
        }

        const afterReturningChain = chains[AOP_TYPES.AFTER_RETURNING];
        if (afterReturningChain) {
          afterReturningChain({ result, method: originalMethod }, ...args);
        }

        return result;
      } catch (error) {
        const afterThrowingChain = chains[AOP_TYPES.AFTER_THROWING];
        if (afterThrowingChain) {
          afterThrowingChain({ error, method: originalMethod }, ...args);
        }
        throw error;
      } finally {
        const afterChain = chains[AOP_TYPES.AFTER];
        if (afterChain) {
          afterChain(...args);
        }
      }
    };
  }

  /**
   * Creates a chain for around decorators.
   *
   * @param params.decorator - The decorator metadata to find
   * @param params.aopDecorators - The list of available AOP decorator instances
   * @param params.originalMethod - The original method function
   * @param params.methodName - The name of the method being processed
   */
  private createAroundChain({
    decorators,
    aopDecorators,
    originalMethod,
    methodName,
  }: ChainCreationParams): Function {
    return decorators.reduceRight((nextMethod, decorator) => {
      const targetDecorator = this.findTargetDecorator({ decorator, aopDecorators, methodName });
      if (targetDecorator?.around) {
        const aroundWrapper = targetDecorator.around({
          method: nextMethod,
          options: decorator.options,
        });
        return (...args: any[]) => aroundWrapper(...args);
      }
      return nextMethod;
    }, originalMethod);
  }

  /**
   * Creates a chain for before decorators.
   *
   * @param params.decorator - The decorator metadata to find
   * @param params.aopDecorators - The list of available AOP decorator instances
   * @param params.originalMethod - The original method function
   * @param params.methodName - The name of the method being processed
   */
  private createBeforeChain({
    decorators,
    aopDecorators,
    originalMethod,
    methodName,
  }: ChainCreationParams): Function {
    return (...args: any[]) => {
      for (const decorator of decorators) {
        const targetDecorator = this.findTargetDecorator({ decorator, aopDecorators, methodName });
        if (targetDecorator?.before) {
          targetDecorator.before({
            method: originalMethod,
            options: decorator.options,
          })(...args);
        }
      }
    };
  }

  /**
   * Creates a chain for after decorators.
   *
   * @param params.decorator - The decorator metadata to find
   * @param params.aopDecorators - The list of available AOP decorator instances
   * @param params.originalMethod - The original method function
   * @param params.methodName - The name of the method being processed
   */
  private createAfterChain({
    decorators,
    aopDecorators,
    originalMethod,
    methodName,
  }: ChainCreationParams): Function {
    return (...args: any[]) => {
      for (const decorator of decorators) {
        const targetDecorator = this.findTargetDecorator({ decorator, aopDecorators, methodName });
        if (targetDecorator?.after) {
          targetDecorator.after({
            method: originalMethod,
            options: decorator.options,
          })(...args);
        }
      }
    };
  }

  /**
   * Creates a chain for after-returning decorators.
   *
   * @param params.decorator - The decorator metadata to find
   * @param params.aopDecorators - The list of available AOP decorator instances
   * @param params.originalMethod - The original method function
   * @param params.methodName - The name of the method being processed
   */
  private createAfterReturningChain({
    decorators,
    aopDecorators,
    methodName,
  }: ChainCreationParams): Function {
    return ({ result, method }: { result: any; method: Function }, ...args: any[]) => {
      for (const decorator of decorators) {
        const targetDecorator = this.findTargetDecorator({ decorator, aopDecorators, methodName });
        if (targetDecorator?.afterReturning) {
          const adviceFunction = targetDecorator.afterReturning({
            method,
            options: decorator.options,
            result,
          });
          if (typeof adviceFunction === 'function') {
            adviceFunction(...args);
          }
        }
      }
    };
  }

  /**
   * Creates a chain for after-throwing decorators.
   *
   * @param params.decorator - The decorator metadata to find
   * @param params.aopDecorators - The list of available AOP decorator instances
   * @param params.originalMethod - The original method function
   * @param params.methodName - The name of the method being processed
   */
  private createAfterThrowingChain({
    decorators,
    aopDecorators,
    methodName,
  }: ChainCreationParams): Function {
    return ({ error, method }: { error: any; method: Function }, ...args: any[]) => {
      for (const decorator of decorators) {
        const targetDecorator = this.findTargetDecorator({ decorator, aopDecorators, methodName });
        if (targetDecorator?.afterThrowing) {
          const adviceFunction = targetDecorator.afterThrowing({
            method,
            options: decorator.options,
            error,
          });
          if (typeof adviceFunction === 'function') {
            adviceFunction(...args);
          }
        }
      }
    };
  }
}
