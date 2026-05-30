import { getAllMethods } from './get-all-methods';

describe('getAllMethods', () => {
  class TestClass {
    constructor() {}

    publicMethod1() {}

    publicMethod2() {}

    get getterMethod() {
      return 'value';
    }

    set setterMethod(_value: string) {}

    static staticMethod() {}

    arrowFunction = () => {};
  }

  it('should return an array of all public methods from a prototype, excluding constructor, private, static methods, getters, and setters', () => {
    const prototype = TestClass.prototype;
    const methods = getAllMethods(prototype);

    // Expect only public instance methods to be returned
    expect(methods).toEqual(expect.arrayContaining(['publicMethod1', 'publicMethod2']));
    expect(methods).not.toContain('constructor');

    // Should not be directly on prototype
    expect(methods).not.toContain('#privateMethod');

    // Getters/setters are property descriptors, not functions directly
    expect(methods).not.toContain('getterMethod');
    expect(methods).not.toContain('setterMethod');

    // Static methods are on the class itself, not the prototype
    expect(methods).not.toContain('staticMethod');

    // Arrow functions are instance properties, not prototype methods
    expect(methods).not.toContain('arrowFunction');

    // Only publicMethod1 and publicMethod2
    expect(methods.length).toBe(2);
  });

  it('should return an empty array for a prototype with no methods', () => {
    class EmptyClass {}
    const prototype = EmptyClass.prototype;
    const methods = getAllMethods(prototype);
    expect(methods).toEqual([]);
  });

  it('should return an empty array for a null or non-object prototype', () => {
    expect(getAllMethods(null)).toEqual([]);
    expect(getAllMethods(undefined)).toEqual([]);
    expect(getAllMethods('not an object')).toEqual([]);
  });

  it('should not invoke getters while collecting method names', () => {
    let getterInvoked = false;
    const prototype = {
      realMethod() {},
    };
    Object.defineProperty(prototype, 'computed', {
      get() {
        getterInvoked = true;
        return () => {};
      },
      enumerable: true,
      configurable: true,
    });

    const methods = getAllMethods(prototype);

    // The getter must never be executed during discovery...
    expect(getterInvoked).toBe(false);
    // ...and a getter (even one returning a function) is not treated as a method.
    expect(methods).toEqual(['realMethod']);
  });

  it('should handle inherited methods', () => {
    class ParentClass {
      parentMethod() {}
    }

    class ChildClass extends ParentClass {
      childMethod() {}
    }

    const prototype = ChildClass.prototype;
    const methods = getAllMethods(prototype);

    // The current implementation does not include inherited methods.
    expect(methods).toEqual(expect.arrayContaining(['childMethod']));
    expect(methods).not.toContain('parentMethod');
    expect(methods.length).toBe(1);
  });
});
