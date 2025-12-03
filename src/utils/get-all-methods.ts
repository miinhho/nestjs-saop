/**
 * Retrieves all method names from a given object prototype
 * excluding the constructor, non-function properties, getters, and setters, private methods.
 *
 * @returns An array of a method name found on the prototype.
 */
export const getAllMethods = (prototype: any): string[] => {
  const propertyKeys = Object.getOwnPropertyNames(prototype);

  const methodNames: string[] = [];
  propertyKeys.forEach(name => {
    if (name === 'constructor') return;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, name);

    if (descriptor && typeof descriptor.value === 'function') {
      methodNames.push(name);
    }
  });

  return methodNames;
};
