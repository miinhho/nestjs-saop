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
