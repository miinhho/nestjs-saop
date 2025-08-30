/**
 * SAOP main module
 */

import { Module, type DynamicModule, type OnModuleInit } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { DecoratorApplier } from './services/decorator-applier.service';
import { InstanceCollector } from './services/instance-collector.service';
import { MethodProcessor } from './services/method-processor.service';

/**
 * Main SAOP module
 */
@Module({
  providers: [InstanceCollector, MethodProcessor, DecoratorApplier],
})
export class SAOPModule implements OnModuleInit {
  /**
   * @param instanceCollector - Instance collector service
   * @param methodProcessor - Method processor service
   * @param decoratorApplier - Decorator applier service
   */
  constructor(
    private readonly instanceCollector: InstanceCollector,
    private readonly methodProcessor: MethodProcessor,
    private readonly decoratorApplier: DecoratorApplier,
  ) {}

  /**
   * Configure SAOP module as global
   * @returns Dynamic module configuration
   */
  static forRoot(): DynamicModule {
    return {
      module: SAOPModule,
      imports: [DiscoveryModule],
      global: true,
    };
  }

  /**
   * Module initialization
   */
  async onModuleInit() {
    await this.initializeAOP();
  }

  /**
   * Initialize AOP system
   */
  private async initializeAOP(): Promise<void> {
    const instances = this.instanceCollector.collectAllInstances();

    for (const wrapper of instances) {
      await this.processInstance(wrapper);
    }
  }

  /**
   * Process single instance
   * @param wrapper - InstanceWrapper object
   */
  private async processInstance(wrapper: any): Promise<void> {
    const methods = this.methodProcessor.processInstanceMethods(wrapper);

    if (methods.length === 0) {
      return;
    }

    const saopDecorators = this.instanceCollector.collectSAOPDecorators();

    for (const { methodName, decorators } of methods) {
      await this.processMethod(wrapper, methodName, decorators, saopDecorators);
    }
  }

  /**
   * Process single method
   * @param wrapper - InstanceWrapper object
   * @param methodName - Method name to process
   * @param decorators - Decorators to apply
   * @param saopDecorators - SAOP decorator instances
   */
  private async processMethod(
    wrapper: any,
    methodName: string,
    decorators: any[],
    saopDecorators: any[],
  ): Promise<void> {
    const prototype = wrapper.metatype.prototype;
    const originalMethod = prototype[methodName];

    this.decoratorApplier.applyDecorators(
      wrapper.instance,
      methodName,
      decorators,
      saopDecorators,
      originalMethod,
    );
  }
}
