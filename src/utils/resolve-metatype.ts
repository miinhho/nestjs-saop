import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

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
  // Handle null or undefined wrapper
  if (!wrapper) {
    return null;
  }

  // First, try the standard metatype (for regular class-based providers)
  if (wrapper.metatype && typeof wrapper.metatype === 'function') {
    // Check if metatype is a real class constructor (not a factory function)
    if (
      wrapper.metatype.prototype &&
      typeof wrapper.metatype.prototype === 'object' &&
      wrapper.metatype !== Function &&
      wrapper.metatype.prototype.constructor === wrapper.metatype
    ) {
      // Additional check: typically have more than just constructor on prototype
      const prototypeKeys = Object.getOwnPropertyNames(wrapper.metatype.prototype);
      const hasClassMethods =
        prototypeKeys.length > 1 || // More than just 'constructor'
        (prototypeKeys.length === 1 && prototypeKeys[0] !== 'constructor'); // Or has methods but not constructor

      // Or check if it looks like a class by checking if instance matches the metatype
      const instanceMatchesMetatype =
        wrapper.instance && wrapper.instance.constructor === wrapper.metatype;

      const hasNoInstance = !wrapper.instance;

      if (hasClassMethods || instanceMatchesMetatype || hasNoInstance) {
        return wrapper.metatype;
      }
    }
  }

  if (!wrapper.instance) {
    return null;
  }

  // For factory providers, use Object.getPrototypeOf to get the actual prototype
  // then get the constructor from that prototype
  const instancePrototype = Object.getPrototypeOf(wrapper.instance);
  if (instancePrototype && instancePrototype.constructor) {
    const constructor = instancePrototype.constructor;

    // Make sure it's a valid constructor and not Object or Function
    if (
      constructor &&
      typeof constructor === 'function' &&
      constructor !== Object &&
      constructor !== Function &&
      constructor.name !== 'Object'
    ) {
      return constructor;
    }
  }

  return null;
}
