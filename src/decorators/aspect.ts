import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';

/**
 * AOP class metadata key for ＠Aspect decorator
 */
export const AOP_CLASS_METADATA_KEY = Symbol('saop:class');

/**
 * Class decorator to mark a class as AOP decorator
 *
 * Apply ＠Injectable also for DI support
 */
export const Aspect = (): ClassDecorator =>
  applyDecorators(SetMetadata(AOP_CLASS_METADATA_KEY, true), Injectable);
