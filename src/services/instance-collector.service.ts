import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { AOP_CLASS_METADATA_KEY } from '../interfaces';

/**
 * Collects instances and AOP decorators from NestJS application
 */
@Injectable()
export class InstanceCollector {
  /**
   * @param discoveryService - NestJS DiscoveryService
   */
  constructor(private readonly discoveryService: DiscoveryService) {}

  /**
   * Collect all instances from controllers and providers
   * @returns Array of controller and provider instances
   */
  collectAllInstances() {
    const controllers = this.discoveryService.getControllers();
    const services = this.discoveryService.getProviders();
    return [...controllers, ...services];
  }

  /**
   * Collect AOP decorator instances from providers
   * @returns Array of AOP decorator instances
   */
  collectAOPDecorators() {
    const providers = this.discoveryService.getProviders();
    const decorators: any[] = [];

    for (const wrapper of providers) {
      if (this.isAOPDecorator(wrapper)) {
        decorators.push(wrapper.instance);
      }
    }

    return decorators;
  }

  /**
   * Check if wrapper contains AOP decorator
   * @param wrapper - InstanceWrapper object
   * @returns True if wrapper contains AOP decorator
   */
  private isAOPDecorator(wrapper: any): boolean {
    if (!wrapper.instance || typeof wrapper.instance !== 'object') {
      return false;
    }

    // Check for @ASpect decorator metadata
    return Reflect.hasMetadata(AOP_CLASS_METADATA_KEY, wrapper.instance.constructor);
  }
}
