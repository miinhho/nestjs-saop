import type { AOPOptions, AOPType } from '../interfaces';

/**
 * Used as a metadata key to store AOP decorator information
 * on target classes and methods.
 *
 * @internal
 */
export const AOP_METADATA_KEY = Symbol('saop:decorators');

/**
 * Stores AOP decorator metadata on the target class.
 *
 * This metadata is later used by the AOP system to apply
 * the appropriate advice to method executions.
 *
 * @param decoratorClass - Name of the decorator class being applied
 * @param target - The target object (instance) where the decorator is applied
 * @param propertyKey - The name or symbol of the method being decorated
 * @param options - Configuration options passed to the decorator
 * @param type - The type of AOP advice (around, before, after, etc.)
 *
 * @internal
 */
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
