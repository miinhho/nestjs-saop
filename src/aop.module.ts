import { Module, type DynamicModule, type OnModuleInit } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { DecoratorApplier } from './services/decorator-applier.service';
import { InstanceCollector } from './services/instance-collector.service';
import { MethodProcessor } from './services/method-processor.service';

/**
 * Main aop module
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
   * Configure aop module as global
   * @returns Dynamic module configuration
   */
  static forRoot(): DynamicModule {
    return {
      module: AOPModule,
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

    const aopDecorators = this.instanceCollector.collectAOPDecorators();

    for (const { methodName, decorators } of methods) {
      await this.processMethod(wrapper, methodName, decorators, aopDecorators);
    }
  }

  /**
   * Process single method
   * @param wrapper - InstanceWrapper object
   * @param methodName - Method name to process
   * @param decorators - Decorators to apply
   * @param aopDecorators - aop decorator instances
   */
  private async processMethod(
    wrapper: any,
    methodName: string,
    decorators: any[],
    aopDecorators: any[],
  ): Promise<void> {
    const prototype = wrapper.metatype.prototype;
    const originalMethod = prototype[methodName];

    this.decoratorApplier.applyDecorators(
      wrapper.instance,
      methodName,
      decorators,
      aopDecorators,
      originalMethod,
    );
  }
}
