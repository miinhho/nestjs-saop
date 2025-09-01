import { Module, type DynamicModule, type OnModuleInit } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import type { AOPMethodWithDecorators, IAOPDecorator } from './interfaces';
import { DecoratorApplier, InstanceCollector, MethodProcessor } from './services';

/**
 * Main AOP module for NestJS
 *
 * It automatically discovers AOP decorators and applies them to target methods at runtime.
 */
@Module({
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
      imports: [DiscoveryModule],
      global: true,
    };
  }

  /**
   * Lifecycle hook called when the module is initialized.
   *
   * Triggers the AOP system setup process.
   */
  onModuleInit() {
    this.initializeAOP();
  }

  /**
   * Main initialization method that scans the application for instances
   * and processes them to apply AOP decorators.
   */
  private initializeAOP() {
    const instances = this.instanceCollector.collectAllInstances();

    for (const wrapper of instances) {
      this.processInstance(wrapper);
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
   */
  private processInstance(wrapper: any) {
    const methods = this.methodProcessor.processInstanceMethods(wrapper);
    if (methods.length === 0) return;

    const aopDecorators = this.instanceCollector.collectAOPDecorators();

    for (const { methodName, decorators } of methods) {
      this.processMethod({ wrapper, methodName, decorators, aopDecorators });
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
  }: {
    wrapper: any;
    aopDecorators: IAOPDecorator[];
  } & AOPMethodWithDecorators) {
    const prototype = wrapper.metatype.prototype;
    const originalMethod = prototype[methodName];

    this.decoratorApplier.applyDecorators({
      instance: wrapper.instance,
      methodName,
      decorators,
      aopDecorators,
      originalMethod,
    });
  }
}
