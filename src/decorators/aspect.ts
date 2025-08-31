import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';
import { AOP_CLASS_METADATA_KEY } from '../interfaces';

/**
 * Class decorator to mark a class as AOP decorator
 */
export function Aspect(): ClassDecorator {
  return applyDecorators(SetMetadata(AOP_CLASS_METADATA_KEY, true), Injectable);
}
