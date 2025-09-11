import { AOP_TYPES, AOPDecoratorMetadata } from '../interfaces';
import { AOP_METADATA_KEY } from '../utils';
import { MethodProcessor } from './method-processor.service';

describe('MethodProcessor', () => {
  let service: MethodProcessor;

  beforeEach(() => {
    service = new MethodProcessor();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processInstanceMethods', () => {
    it('should process methods with AOP decorators', () => {
      class TestClass {
        method1() {}
        method2() {}
      }
      class TestDecorator {}

      const mockDecorators: AOPDecoratorMetadata[] = [
        { type: AOP_TYPES.BEFORE, options: {}, order: 0, decoratorClass: TestDecorator },
      ];
      const wrapper = {
        instance: new TestClass(),
        metatype: TestClass,
      };

      Reflect.getMetadata = jest.fn();
      (Reflect.getMetadata as jest.Mock)
        .mockReturnValueOnce(mockDecorators) // method1 has decorators
        .mockReturnValueOnce(mockDecorators) // method1 has decorators
        .mockReturnValueOnce(undefined) // method2 has no decorators
        .mockReturnValueOnce(undefined); // method2 has no decorators

      const result = service.processInstanceMethods(wrapper);
      const expectMetadata = [
        {
          methodName: 'method1',
          decorators: [
            {
              ...mockDecorators[0],
              order: [
                {
                  order: 0,
                  decoratorClass: TestDecorator,
                  type: AOP_TYPES.BEFORE,
                  options: {},
                },
              ],
            },
          ],
        },
      ];

      expect(result).toEqual(expectMetadata);
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
      const result = (service as any).getMethodNames('foo');

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
    it('should return decorators with order when decorators exist and have order', () => {
      class TestDecorator {
        testMethod() {}
      }
      const mockDecorators = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator },
      ];
      const mockOrder = [{ order: 1 }];

      const methodName = 'testMethod';
      jest.spyOn(service as any, 'getAspectDecorator').mockReturnValue(mockDecorators);
      jest.spyOn(service as any, 'getAspectOrderDecorator').mockReturnValue(mockOrder);

      const result = (service as any).getDecorators(TestDecorator, methodName);

      expect(result).toEqual([{ ...mockDecorators[0], order: mockOrder }]);
      expect((service as any).getAspectDecorator).toHaveBeenCalledWith(TestDecorator, methodName);
      expect((service as any).getAspectOrderDecorator).toHaveBeenCalledWith(mockDecorators[0]);
    });

    it('should skip decorators without order', () => {
      class TestDecorator {
        testMethod() {}
      }
      const mockDecorators = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator },
      ];

      jest.spyOn(service as any, 'getAspectDecorator').mockReturnValue(mockDecorators);
      jest.spyOn(service as any, 'getAspectOrderDecorator').mockReturnValue(undefined);

      const result = (service as any).getDecorators(TestDecorator, 'testMethod');

      expect(result).toEqual([undefined]);
    });

    it('should return undefined when no decorators exist', () => {
      const methodName = 'testMethod';
      jest.spyOn(service as any, 'getAspectDecorator').mockReturnValue(undefined);

      const result = (service as any).getDecorators({}, methodName);

      expect(result).toBeUndefined();
      expect((service as any).getAspectDecorator).toHaveBeenCalledWith({}, methodName);
    });

    it('should return undefined when decorators array is empty', () => {
      jest.spyOn(service as any, 'getAspectDecorator').mockReturnValue([]);

      const result = (service as any).getDecorators({}, 'testMethod');

      expect(result).toBeUndefined();
    });

    it('should handle multiple decorators with mixed order availability', () => {
      class TestDecorator {
        testMethod() {}
      }
      const mockDecorators = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator },
        { type: AOP_TYPES.AFTER, options: {}, decoratorClass: TestDecorator },
      ];
      const mockOrder1 = [{ order: 1 }];
      const mockOrder2 = undefined;

      jest.spyOn(service as any, 'getAspectDecorator').mockReturnValue(mockDecorators);
      jest
        .spyOn(service as any, 'getAspectOrderDecorator')
        .mockReturnValueOnce(mockOrder1)
        .mockReturnValueOnce(mockOrder2);

      const result = (service as any).getDecorators(TestDecorator, 'testMethod');

      expect(result).toEqual([{ ...mockDecorators[0], order: mockOrder1 }, undefined]);
    });
  });
});
