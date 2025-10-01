import { Module, type DynamicModule, type OnModuleInit } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import type { AOPMethodWithDecorators, IAOPDecorator } from './interfaces';
import { DecoratorApplier, InstanceCollector, MethodProcessor } from './services';
import { logger } from './utils';

/**
 * Main AOP module for NestJS
 *
 * It automatically discovers AOP decorators and applies them to target methods at runtime.
 */
@Module({
  imports: [DiscoveryModule],
  providers: [InstanceCollector, MethodProcessor, DecoratorApplier],
})
export class AOPModule implements OnModuleInit {
  constructor(
    private readonly instanceCollector: InstanceCollector,
    private readonly methodProcessor: MethodProcessor,
    private readonly decoratorApplier: DecoratorApplier,
  ) {}

  /**
   * Configure AOP module as global
   *
   * @returns Dynamic module configuration for global AOP support
   */
  static forRoot(): DynamicModule {
    return {
      module: AOPModule,
      global: true,
    };
  }

  /**
   * Lifecycle hook called when the module is initialized.
   *
   * Triggers the AOP system setup process.
   */
  onModuleInit(): void {
    this.initializeAOP();
  }

  /**
   * Main initialization method that scans the application for instances
   * and processes them to apply AOP decorators.
   */
  private initializeAOP(): void {
    try {
      const instances = this.instanceCollector.collectAllInstances();
      const aopDecorators = this.instanceCollector.collectAOPDecorators();

      for (const wrapper of instances) {
        this.processInstance(wrapper, aopDecorators);
      }
    } catch (error) {
      logger.error('Failed to initialize AOP module:', error);
      throw error;
    }
  }

  /**
   * Processes a single instance wrapper to find and apply AOP decorators
   * to its methods.
   *
   * If the instance has decorated methods, it collects
   * the necessary AOP decorator instances and applies them.
   *
   * @param wrapper - InstanceWrapper object containing the instance to process
   * @param aopDecorators - Pre-collected AOP decorator instances for better performance
   */
  private processInstance(wrapper: InstanceWrapper, aopDecorators: IAOPDecorator[]): void {
    try {
      if (!wrapper) {
        logger.warn('Null or undefined wrapper provided, skipping');
        return;
      }

      const { methods, metatype } = this.methodProcessor.processInstanceMethods(wrapper);
      if (metatype === null || methods.length === 0) return;

      for (const { methodName, decorators } of methods) {
        const prototype = metatype.prototype;
        const originalMethod = prototype[methodName];
        this.processMethod({ wrapper, methodName, decorators, aopDecorators, originalMethod });
      }
    } catch (error) {
      const wrapperName = wrapper?.name || 'unknown';
      logger.error(`Failed to process instance ${wrapperName}:`, error);
    }
  }

  /**
   * Applies AOP decorators to a specific method of an instance.
   *
   * Retrieves the original method,
   * then apply all relevant AOP advice to the method.
   *
   * @param wrapper - InstanceWrapper object containing the instance
   * @param methodName - Name of the method to process
   * @param decorators - Array of decorators to apply to the method
   * @param aopDecorators - Array of AOP decorator instances available for application
   */
  private processMethod({
    wrapper,
    methodName,
    decorators,
    aopDecorators,
    originalMethod,
  }: {
    wrapper: InstanceWrapper;
    aopDecorators: IAOPDecorator[];
    originalMethod: Function;
  } & AOPMethodWithDecorators): void {
    try {
      this.decoratorApplier.applyDecorators({
        instance: wrapper.instance,
        methodName,
        decorators,
        aopDecorators,
        originalMethod,
      });
    } catch (error) {
      const wrapperName = wrapper?.name || 'unknown';
      logger.error(`Failed to process method ${methodName} on ${wrapperName}:`, error);
    }
  }
}
