import { Injectable } from '@nestjs/common';
import {
  AOP_TYPES,
  AOPDecoratorMetadataWithOrder,
  AOPOptions,
  type IAOPDecorator,
} from '../interfaces';
import { logger } from '../utils';

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
 * An AOP decorator instance resolved from its metadata, paired with the
 * options the advice was registered with. Resolved once at apply-time so the
 * runtime hot path never has to look the instance up again.
 *
 * @internal
 */
type ResolvedAdvice = {
  instance: IAOPDecorator;
  options: AOPOptions;
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
   * Marker set on the wrapped method so that already-applied methods can be
   * detected without relying on the function name (which minifiers rewrite).
   */
  private static readonly AOP_APPLIED_MARKER = Symbol('aop:applied');

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
      if (descriptor?.value?.[DecoratorApplier.AOP_APPLIED_MARKER]) {
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
    // Copy first: `decorators` is shared from MethodProcessor's cache, so sorting
    // in place would mutate cached state.
    const sortedDecorators = [...decorators].sort((a, b) => a.order - b.order);

    const decoratorsByType: Record<string, AOPDecoratorMetadataWithOrder[]> = {};
    for (const decorator of sortedDecorators) {
      const type = decorator.type;
      if (!decoratorsByType[type]) {
        decoratorsByType[type] = [];
      }
      decoratorsByType[type].push(decorator);
    }

    const execution = this.createExecution({
      decoratorsByType,
      aopDecorators,
      originalMethod,
      methodName,
      instance,
    });

    // Wrap so the instance is bound as `this` and the applied-marker is attached.
    const combinedMethod = this.combineChains({ execution, instance });

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
   * Resolves a list of decorator metadata into advice instances paired with
   * their options, keeping only those whose instance implements `adviceKey`.
   *
   * This runs once at apply-time, so the runtime advice loops never call
   * {@link findTargetDecorator} (a linear search) on every invocation.
   *
   * @returns Resolved advices in metadata (already order-sorted) order
   */
  private resolveAdvices(
    decorators: AOPDecoratorMetadataWithOrder[],
    aopDecorators: IAOPDecorator[],
    methodName: string,
    adviceKey: keyof IAOPDecorator,
  ): ResolvedAdvice[] {
    const resolved: ResolvedAdvice[] = [];
    for (const decorator of decorators) {
      const instance = this.findTargetDecorator({ decorator, aopDecorators, methodName });
      if (instance && typeof instance[adviceKey] === 'function') {
        resolved.push({ instance, options: decorator.options });
      }
    }
    return resolved;
  }

  /**
   * Builds the final execution function for a method using Spring AOP execution order.
   *
   * Around advice wraps the core execution (Before -> Method ->
   * AfterReturning/AfterThrowing -> After). When no Around advice exists, the
   * core execution itself is the final execution.
   *
   * @returns The function that runs the original method wrapped with all advice
   */
  private createExecution({
    decoratorsByType,
    aopDecorators,
    originalMethod,
    methodName,
    instance,
  }: {
    decoratorsByType: Record<string, AOPDecoratorMetadataWithOrder[]>;
    instance: any;
  } & Omit<ChainCreationParams, 'decorators'>): Function {
    // Core execution wraps the original method with Before/After advice.
    const coreExecution = this.createCoreExecution({
      decoratorsByType,
      aopDecorators,
      originalMethod,
      methodName,
      instance,
    });

    // Around advice (resolved once) wraps the core execution from the inside out.
    const aroundAdvices = this.resolveAdvices(
      decoratorsByType[AOP_TYPES.AROUND] ?? [],
      aopDecorators,
      methodName,
      'around',
    );

    if (aroundAdvices.length === 0) {
      return coreExecution;
    }

    return aroundAdvices.reduceRight((nextMethod, { instance: advice, options }) => {
      return function (this: any, ...args: any[]) {
        const context = {
          method: originalMethod,
          instance: this,
          options,
          proceed: (...proceedArgs: any[]) => nextMethod.call(this, ...proceedArgs),
        };

        const aroundWrapper = advice.around!(context);
        return aroundWrapper.call(this, ...args);
      };
    }, coreExecution);
  }

  /**
   * Creates the core execution function that wraps the original method with Before/After advice.
   */
  private createCoreExecution({
    decoratorsByType,
    aopDecorators,
    originalMethod,
    methodName,
    instance,
  }: {
    decoratorsByType: Record<string, AOPDecoratorMetadataWithOrder[]>;
    instance: any;
  } & Omit<ChainCreationParams, 'decorators'>): Function {
    // Resolve every advice instance once, up front, so the returned closure
    // never performs a lookup while the method is being called.
    const resolve = (type: string, adviceKey: keyof IAOPDecorator) =>
      this.resolveAdvices(decoratorsByType[type] ?? [], aopDecorators, methodName, adviceKey);

    const beforeAdvices = resolve(AOP_TYPES.BEFORE, 'before');
    const afterAdvices = resolve(AOP_TYPES.AFTER, 'after');
    const afterReturningAdvices = resolve(AOP_TYPES.AFTER_RETURNING, 'afterReturning');
    const afterThrowingAdvices = resolve(AOP_TYPES.AFTER_THROWING, 'afterThrowing');

    const runBefore = (args: any[]) => {
      for (const { instance: advice, options } of beforeAdvices) {
        advice.before!({ method: originalMethod, options })(...args);
      }
    };

    const runAfterReturning = (result: any, args: any[]) => {
      for (const { instance: advice, options } of afterReturningAdvices) {
        advice.afterReturning!({ method: originalMethod, options, result })(...args);
      }
    };

    const runAfterThrowing = (error: unknown, args: any[]) => {
      for (const { instance: advice, options } of afterThrowingAdvices) {
        advice.afterThrowing!({ method: originalMethod, options, error })(...args);
      }
    };

    const runAfter = (args: any[]) => {
      for (const { instance: advice, options } of afterAdvices) {
        advice.after!({ method: originalMethod, options })(...args);
      }
    };

    return (...args: any[]) => {
      // Execute Before advice
      runBefore(args);

      let result: any;
      try {
        // Execute original method
        result = originalMethod.apply(instance, args);
      } catch (error) {
        // Synchronous throw
        runAfterThrowing(error, args);
        runAfter(args);
        throw error;
      }

      // Asynchronous path: defer after-advice until the promise settles so that
      // AfterReturning receives the resolved value and AfterThrowing catches rejections.
      if (result !== null && typeof result?.then === 'function') {
        return result.then(
          (resolved: any) => {
            runAfterReturning(resolved, args);
            runAfter(args);
            return resolved;
          },
          (error: unknown) => {
            runAfterThrowing(error, args);
            runAfter(args);
            throw error;
          },
        );
      }

      // Synchronous path
      runAfterReturning(result, args);
      runAfter(args);
      return result;
    };
  }

  /**
   * Wraps the final execution function into the method placed on the prototype.
   *
   * Binds the instance as `this` (so Around advice sees the right receiver) and
   * tags the wrapper with the applied-marker for duplicate detection.
   *
   * @param params.execution - The final execution function (with all advice applied)
   * @param params.instance - The instance of the class containing the method
   *
   * @returns The method to install on the prototype
   */
  private combineChains({ execution, instance }: { execution: Function; instance: any }): Function {
    const combinedAOPMethod = function (this: any, ...args: any[]) {
      return execution.call(instance, ...args);
    };

    Object.defineProperty(combinedAOPMethod, DecoratorApplier.AOP_APPLIED_MARKER, {
      value: true,
      enumerable: false,
    });

    return combinedAOPMethod;
  }
}
