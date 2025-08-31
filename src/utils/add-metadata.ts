import type { AOPOptions, AOPType } from '../interfaces';

/**
 * AOP metadata key
 */
export const AOP_METADATA_KEY = Symbol('saop:decorators');

export const addMetadata = ({
  decoratorClass,
  target,
  propertyKey,
  options = {},
  type,
}: {
  decoratorClass: string;
  target: any;
  propertyKey: string | symbol;
  options: AOPOptions;
  type: AOPType;
}) => {
  const existingDecorators =
    Reflect.getMetadata(AOP_METADATA_KEY, target.constructor, propertyKey) || [];
  existingDecorators.push({
    type,
    options,
    decoratorClass,
  });
  Reflect.defineMetadata(AOP_METADATA_KEY, existingDecorators, target.constructor, propertyKey);
};
