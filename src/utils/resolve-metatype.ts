import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

/**
 * Whether `metatype` is a real class constructor rather than a factory
 * function. Arrow/async factory functions have no class-style prototype, and
 * the native `Function` constructor is explicitly excluded.
 */
function isClassConstructor(metatype: Function): boolean {
  const prototype = metatype.prototype;
  return (
    !!prototype &&
    typeof prototype === 'object' &&
    metatype !== Function &&
    prototype.constructor === metatype
  );
}

/**
 * Whether a class `metatype` can be used as the resolved type for `instance`.
 *
 * It qualifies when it actually declares methods, when it is the constructor
 * of the given instance, or when there is no instance to cross-check against.
 */
function metatypeMatchesInstance(metatype: Function, instance: unknown): boolean {
  const prototypeKeys = Object.getOwnPropertyNames(metatype.prototype);
  const hasClassMethods =
    prototypeKeys.length > 1 || (prototypeKeys.length === 1 && prototypeKeys[0] !== 'constructor');
  const instanceMatchesMetatype = !!instance && (instance as any).constructor === metatype;
  const hasNoInstance = !instance;

  return hasClassMethods || instanceMatchesMetatype || hasNoInstance;
}

/**
 * Recovers the constructor from a (factory-created) instance via its
 * prototype, ignoring plain `Object`/`Function` constructors.
 */
function resolveConstructorFromInstance(instance: object): Function | null {
  const instancePrototype = Object.getPrototypeOf(instance);
  const constructor = instancePrototype?.constructor;

  if (
    typeof constructor === 'function' &&
    constructor !== Object &&
    constructor !== Function &&
    constructor.name !== 'Object'
  ) {
    return constructor;
  }

  return null;
}

/**
 * Resolves the class constructor from a wrapper, supporting both
 * regular class-based providers and factory-created instances.
 *
 * @param wrapper - InstanceWrapper from NestJS discovery
 *
 * @returns The class constructor if found, null otherwise
 * @internal
 */
export function resolveMetatype(wrapper: InstanceWrapper): Function | null {
  if (!wrapper) {
    return null;
  }

  const { metatype, instance } = wrapper;

  // Regular class-based providers: prefer the metatype when it is a real class.
  if (typeof metatype === 'function' && isClassConstructor(metatype)) {
    if (metatypeMatchesInstance(metatype, instance)) {
      return metatype;
    }
  }

  // Factory providers: the metatype is the factory, so recover the class from
  // the instance it produced.
  if (!instance) {
    return null;
  }

  return resolveConstructorFromInstance(instance);
}
