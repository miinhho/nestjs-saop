import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';

/**
 * AOP class metadata key for @Aspect decorator
 */
export const AOP_CLASS_METADATA_KEY = Symbol('saop:class');

/**
 * Class decorator to mark a class as AOP decorator
 */
export function Aspect(): ClassDecorator {
  return applyDecorators(SetMetadata(AOP_CLASS_METADATA_KEY, true), Injectable);
}
