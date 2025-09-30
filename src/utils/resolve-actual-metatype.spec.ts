import { resolveActualMetatype } from './resolve-actual-metatype';

describe('resolveActualMetatype', () => {
  describe('regular class-based providers', () => {
    it('should return metatype for valid class constructor', () => {
      class TestClass {
        testMethod() {}
      }

      const wrapper = {
        metatype: TestClass,
        instance: new TestClass(),
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBe(TestClass);
    });

    it('should return null for Function constructor', () => {
      const wrapper = {
        metatype: Function,
        instance: {},
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBeNull();
    });

    it('should return null for metatype without prototype', () => {
      const mockFunction = jest.fn();
      mockFunction.prototype = null;

      const wrapper = {
        metatype: mockFunction,
        instance: {},
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBeNull();
    });

    it('should return null for non-function metatype', () => {
      const wrapper = {
        metatype: 'not-a-function',
        instance: {},
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBeNull();
    });
  });

  describe('factory providers', () => {
    it('should resolve constructor from factory-created instance', () => {
      class FactoryCreatedClass {
        constructor(public name: string) {}

        getName() {
          return this.name;
        }
      }

      const instance = new FactoryCreatedClass('test');
      const wrapper = {
        metatype: () => instance, // Factory function
        instance,
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBe(FactoryCreatedClass);
    });

    it('should handle factory provider with complex inheritance', () => {
      class BaseClass {
        baseMethod() {}
      }

      class DerivedClass extends BaseClass {
        derivedMethod() {}
      }

      const instance = new DerivedClass();
      const wrapper = {
        metatype: () => instance,
        instance,
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBe(DerivedClass);
    });

    it('should return null for Object constructor', () => {
      const plainObject = {};
      const wrapper = {
        metatype: () => plainObject,
        instance: plainObject,
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBeNull();
    });

    it('should return null for primitive-like objects', () => {
      const primitiveObject = Object.create(null);
      const wrapper = {
        metatype: () => primitiveObject,
        instance: primitiveObject,
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle null wrapper', () => {
      const result = resolveActualMetatype(null);
      expect(result).toBeNull();
    });

    it('should handle wrapper without instance', () => {
      class TestClass {}
      const wrapper = {
        metatype: TestClass,
        // no instance property
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBe(TestClass);
    });

    it('should handle wrapper with null instance', () => {
      class TestClass {}
      const wrapper = {
        metatype: TestClass,
        instance: null,
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBe(TestClass);
    });

    it('should handle instance with constructor that is Object', () => {
      const plainObject = { constructor: Object };
      const wrapper = {
        metatype: () => plainObject,
        instance: plainObject,
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBeNull();
    });

    it('should handle instance with constructor that is Function', () => {
      const funcObject = { constructor: Function };
      const wrapper = {
        metatype: () => funcObject,
        instance: funcObject,
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBeNull();
    });
  });

  describe('real-world scenarios', () => {
    it('should work with NestJS-like factory provider wrapper', () => {
      class DatabaseService {
        constructor(private config: any) {}

        query(sql: string) {
          return `Executing: ${sql} with config: ${JSON.stringify(this.config)}`;
        }
      }

      const config = { host: 'localhost', port: 5432 };
      const instance = new DatabaseService(config);

      // Simulate how NestJS creates factory provider wrappers
      const wrapper = {
        metatype: function useFactory() {
          return new DatabaseService(config);
        },
        instance,
        name: 'DATABASE_SERVICE',
        scope: 'DEFAULT',
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBe(DatabaseService);
      expect(result?.name).toBe('DatabaseService');
    });

    it('should work with async factory providers', () => {
      class ApiClient {
        constructor(private apiKey: string) {}

        async getData() {
          return `Data with key: ${this.apiKey}`;
        }
      }

      const instance = new ApiClient('secret-key');

      const wrapper = {
        metatype: async function asyncFactory() {
          return new ApiClient('secret-key');
        },
        instance,
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBe(ApiClient);
    });

    it('should prioritize metatype over prototype resolution when metatype is valid', () => {
      class ValidClass {
        validMethod() {}
      }

      class AnotherClass {
        anotherMethod() {}
      }

      const instance = new AnotherClass();

      const wrapper = {
        metatype: ValidClass, // Valid class constructor
        instance, // Instance of different class
      };

      const result = resolveActualMetatype(wrapper);
      expect(result).toBe(ValidClass); // Should prioritize metatype
    });
  });
});
