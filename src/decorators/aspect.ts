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

export const AOP_ORDER_METADATA_KEY = Symbol('saop:order');

export type AspectOptions = {
  order?: number;
};

/**
 * Class decorator to mark a class as AOP decorator
 *
 * Classes decorated with ＠Aspect are automatically registered as injectable
 * services and can be used to apply cross-cutting concerns to methods.
 *
 * @returns A class decorator function
 *
 * @example
 * ```typescript
 * ＠Aspect()
 * export class LoggingAspect {
 *   // AOP methods will be implemented here
 * }
 * ```
 */
export const Aspect = ({ order = 0 }: AspectOptions): ClassDecorator =>
  applyDecorators(
    SetMetadata(AOP_CLASS_METADATA_KEY, true),
    SetMetadata(AOP_ORDER_METADATA_KEY, order),
    Injectable,
  );
