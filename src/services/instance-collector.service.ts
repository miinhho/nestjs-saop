import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

/**
 * Collects instances and SAOP decorators from NestJS application
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
   * Collect SAOP decorator instances from providers
   * @returns Array of SAOP decorator instances
   */
  collectSAOPDecorators() {
    const providers = this.discoveryService.getProviders();
    const decorators: any[] = [];

    for (const wrapper of providers) {
      if (this.isSAOPDecorator(wrapper)) {
        decorators.push(wrapper.instance);
      }
    }

    return decorators;
  }

  /**
   * Check if wrapper contains SAOP decorator
   * @param wrapper - InstanceWrapper object
   * @returns True if wrapper contains SAOP decorator
   */
  private isSAOPDecorator(wrapper: any): boolean {
    if (!wrapper.instance || typeof wrapper.instance !== 'object') {
      return false;
    }

    return (
      'around' in wrapper.instance ||
      'before' in wrapper.instance ||
      'after' in wrapper.instance ||
      'afterReturning' in wrapper.instance ||
      'afterThrowing' in wrapper.instance
    );
  }
}
