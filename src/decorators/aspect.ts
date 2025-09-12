import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';

/**
 * AOP class metadata key for ＠Aspect decorator
 *
 * This key is used internally by the AOP system to recognize and process
 * aspect classes during application initialization.
 *
 * @internal
 */
export const AOP_CLASS_METADATA_KEY = Symbol('saop:class');

/**
 * AOP order metadata key for the ＠Aspect decorator.
 *
 * This key is used to store the execution order of aspects.
 *
 * @internal
 */
export const AOP_ORDER_METADATA_KEY = Symbol('saop:order');

/**
 * Options for the ＠Aspect decorator
 *
 * @property `order` - The order in which this aspect should be applied. Lower values execute first. Default is `Number.MAX_SAFE_INTEGER`.
 */
export type AspectOptions = {
  /**
   * The order in which this aspect should be applied.
   * Lower values execute first. Default is Number.MAX_SAFE_INTEGER.
   */
  order?: number;
};

/**
 * Class decorator to mark a class as AOP decorator
 *
 * Classes decorated with ＠Aspect are automatically registered as injectable
 * services and can be used to apply cross-cutting concerns to methods.
 *
 * @param options.order - The order in which this aspect should be applied. Lower values execute first.
 * @returns A class decorator function
 *
 * @example
 * ```typescript
 * ＠Aspect({ order: 1 })
 * export class LoggingAspect {
 *   // AOP methods will be implemented here
 * }
 * ```
 */
export const Aspect = ({ order = Number.MAX_SAFE_INTEGER }: AspectOptions = {}): ClassDecorator =>
  applyDecorators(
    SetMetadata(AOP_CLASS_METADATA_KEY, true),
    SetMetadata(AOP_ORDER_METADATA_KEY, order),
    Injectable,
  );
