import { AOP_METADATA_KEY } from '../utils';
import { MethodProcessor } from './method-processor.service';

describe('MethodProcessor', () => {
  let service: MethodProcessor;

  beforeEach(() => {
    service = new MethodProcessor();
  });

  describe('processInstanceMethods', () => {
    it('should process methods with AOP decorators', () => {
      class TestClass {
        method1() {}
        method2() {}
      }

      const mockDecorators = [{ type: 'before', options: {} }];
      const wrapper = {
        instance: new TestClass(),
        metatype: TestClass,
      };

      Reflect.getMetadata = jest.fn();
      (Reflect.getMetadata as jest.Mock)
        .mockReturnValueOnce(mockDecorators) // method1 has decorators
        .mockReturnValueOnce(undefined); // method2 has no decorators

      const result = service.processInstanceMethods(wrapper);

      expect(result).toEqual([{ methodName: 'method1', decorators: mockDecorators }]);
      expect(Reflect.getMetadata).toHaveBeenCalledWith(AOP_METADATA_KEY, TestClass, 'method1');
      expect(Reflect.getMetadata).toHaveBeenCalledWith(AOP_METADATA_KEY, TestClass, 'method2');
    });

    it('should return empty array if no methods with decorators', () => {
      class TestClass {
        method1() {}
      }

      const wrapper = {
        instance: new TestClass(),
        metatype: TestClass,
      };

      Reflect.getMetadata = jest.fn().mockReturnValue(undefined);

      const result = service.processInstanceMethods(wrapper);

      expect(result).toEqual([]);
    });

    it('should handle invalid wrapper', () => {
      const wrapper = { instance: null, metatype: null };

      const result = service.processInstanceMethods(wrapper);

      expect(result).toEqual([]);
    });

    it('should handle class with no prototype methods', () => {
      class TestClass {}

      const wrapper = {
        instance: new TestClass(),
        metatype: TestClass,
      };

      const result = service.processInstanceMethods(wrapper);

      expect(result).toEqual([]);
    });

    it('should skip constructor and non-function properties', () => {
      class TestClass {
        constructor() {}
        method1() {}
        property = 'value';
      }

      const wrapper = {
        instance: new TestClass(),
        metatype: TestClass,
      };

      Reflect.getMetadata = jest.fn().mockReturnValue([{ type: 'before' }]);

      const result = service.processInstanceMethods(wrapper);

      expect(result).toHaveLength(1);
      expect(result[0]!.methodName).toBe('method1');
    });
  });

  describe('getPrototype', () => {
    it('should return prototype for valid metatype', () => {
      class TestClass {}

      const result = (service as any).getPrototype(TestClass);

      expect(result).toBe(TestClass.prototype);
    });

    it('should return null for invalid metatype', () => {
      const result = (service as any).getPrototype(null);

      expect(result).toBeNull();
    });

    it('should return null if prototype is invalid', () => {
      const invalidMetatype = { prototype: null };

      const result = (service as any).getPrototype(invalidMetatype);

      expect(result).toBeNull();
    });

    it('should return null if accessing prototype throws error', () => {
      const problematicMetatype = Object.create(null);
      Object.defineProperty(problematicMetatype, 'prototype', {
        get() {
          throw new Error('Cannot access prototype');
        },
      });

      const result = (service as any).getPrototype(problematicMetatype);

      expect(result).toBeNull();
    });
  });

  describe('getMethodNames', () => {
    it('should return method names from prototype', () => {
      class TestClass {
        method1() {}
        method2() {}
        property = 'value';
      }

      const result = (service as any).getMethodNames(TestClass.prototype);

      expect(result).toEqual(['method1', 'method2']);
    });

    it('should exclude constructor', () => {
      class TestClass {
        constructor() {}
        method1() {}
      }

      const result = (service as any).getMethodNames(TestClass.prototype);

      expect(result).toEqual(['method1']);
    });

    it('should handle invalid prototype', () => {
      const result = (service as any).getMethodNames(null);

      expect(result).toEqual([]);
    });

    it('should handle prototype with non-function properties', () => {
      const prototype = {
        method1: () => {},
        property: 'value',
        method2: 'not a function',
      };

      const result = (service as any).getMethodNames(prototype);

      expect(result).toEqual(['method1']);
    });

    it('should handle error when accessing Object.getOwnPropertyNames', () => {
      const problematicPrototype = Object.create(null);
      Object.defineProperty(problematicPrototype, 'constructor', {
        get() {
          throw new Error('Cannot access properties');
        },
      });

      const result = (service as any).getMethodNames(problematicPrototype);

      expect(result).toEqual([]);
    });

    it('should handle error when checking property type', () => {
      const prototype = {
        method1: () => {},
        problematicProperty: Object.defineProperty({}, 'value', {
          get() {
            throw new Error('Cannot access property');
          },
        }),
      };

      const result = (service as any).getMethodNames(prototype);

      expect(result).toEqual(['method1']);
    });
  });

  describe('getDecorators', () => {
    it('should return decorators from metadata', () => {
      class TestClass {}

      const mockDecorators = [{ type: 'before' }];
      Reflect.getMetadata = jest.fn().mockReturnValue(mockDecorators);

      const result = (service as any).getDecorators(TestClass, 'method1');

      expect(result).toEqual(mockDecorators);
      expect(Reflect.getMetadata).toHaveBeenCalledWith(AOP_METADATA_KEY, TestClass, 'method1');
    });

    it('should return undefined if no metadata', () => {
      class TestClass {}

      Reflect.getMetadata = jest.fn().mockReturnValue(undefined);

      const result = (service as any).getDecorators(TestClass, 'method1');

      expect(result).toBeUndefined();
    });
  });
});
