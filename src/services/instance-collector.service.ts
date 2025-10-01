import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { AOP_CLASS_METADATA_KEY } from '../decorators';
import type { IAOPDecorator } from '../interfaces';

/**
 * Scans the application for controllers, providers,
 * and AOP decorator instances.
 *
 * It provides utilities to collect AOP-related components.
 *
 * @internal
 */
@Injectable()
export class InstanceCollector {
  private cachedAOPDecorators: IAOPDecorator[] | null = null;

  constructor(private readonly discoveryService: DiscoveryService) {}

  /**
   * Gathers all controller and provider instances from the NestJS application.
   *
   * @returns Array of controller and provider instance wrappers
   */
  collectAllInstances() {
    const controllers = this.discoveryService.getControllers();
    const services = this.discoveryService.getProviders();
    return [...controllers, ...services];
  }

  /**
   * Scans all providers in the application and identifies those that are
   * AOP decorators (marked with ＠Aspect).
   *
   * @returns Array of AOP decorator instances
   */
  collectAOPDecorators(): IAOPDecorator[] {
    if (this.cachedAOPDecorators !== null) {
      return this.cachedAOPDecorators;
    }

    const providers = this.discoveryService.getProviders();
    const decorators: IAOPDecorator[] = [];

    for (const wrapper of providers) {
      if (this.isAOPDecorator(wrapper)) {
        decorators.push(wrapper.instance);
      }
    }

    this.cachedAOPDecorators = decorators;
    return decorators;
  }

  /**
   * Determines whether a given instance wrapper contains an AOP decorator
   * by checking for the presence of the ＠Aspect metadata key on the
   * instance's constructor.
   *
   * @param wrapper - InstanceWrapper object from NestJS discovery
   *
   * @returns `true` if the wrapper contains an AOP decorator instance
   */
  private isAOPDecorator(wrapper: InstanceWrapper): boolean {
    if (!wrapper.instance || typeof wrapper.instance !== 'object') {
      return false;
    }

    // Check for ＠Aspect decorator metadata
    return Reflect.hasMetadata(AOP_CLASS_METADATA_KEY, wrapper.instance.constructor);
  }
}
