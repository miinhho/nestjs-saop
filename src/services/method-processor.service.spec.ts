import { AOP_ORDER_METADATA_KEY } from '../decorators';
import { AOPError } from '../error';
import { AOP_TYPES, AOPDecoratorMetadataWithOrder } from '../interfaces';
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
      class TestDecorator {}

      const mockDecorators: AOPDecoratorMetadataWithOrder[] = [
        { type: AOP_TYPES.BEFORE, options: {}, order: 0, decoratorClass: TestDecorator },
      ];
      const wrapper = {
        instance: new TestClass(),
        metatype: TestClass,
      };

      Reflect.getMetadata = jest.fn();
      (Reflect.getMetadata as jest.Mock).mockImplementation((key, target, propertyKey) => {
        if (key === AOP_METADATA_KEY) {
          if (propertyKey === 'method1') return mockDecorators;
          if (propertyKey === 'method2') return undefined;
        }
        if (key === AOP_ORDER_METADATA_KEY && target === TestDecorator) {
          return 0; // Mock order value
        }
        return undefined;
      });

      const result = service.processInstanceMethods(wrapper);
      const expectMetadata = [
        {
          methodName: 'method1',
          decorators: [
            {
              ...mockDecorators[0],
              order: 0,
            },
          ],
        },
      ];

      expect(result).toEqual(expectMetadata);
      expect(Reflect.getMetadata).toHaveBeenCalledWith(AOP_METADATA_KEY, TestClass, 'method1');
      expect(Reflect.getMetadata).toHaveBeenCalledWith(AOP_METADATA_KEY, TestClass, 'method2');
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

      const getMetadataSpy = jest.spyOn(Reflect, 'getMetadata');
      getMetadataSpy.mockImplementation((key, target, propertyKey) => {
        if (key === AOP_METADATA_KEY && propertyKey === 'method1') {
          return [{ type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestClass }];
        }
        if (key === AOP_ORDER_METADATA_KEY && target === TestClass) {
          return 0;
        }
        return undefined;
      });

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
  });

  describe('getDecorators', () => {
    it('should return decorators with order when decorators exist and have order', () => {
      class TestDecorator {
        testMethod() {}
      }
      const mockDecorators = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator },
      ];
      const mockOrder = 1;

      const methodName = 'testMethod';
      jest.spyOn(service as any, 'getAspectDecorator').mockReturnValue(mockDecorators);
      jest.spyOn(service as any, 'getAspectOrderDecorator').mockReturnValue(mockOrder);

      const result = (service as any).getDecorators(TestDecorator, methodName);

      expect(result).toEqual([{ ...mockDecorators[0], order: mockOrder }]);
      expect((service as any).getAspectDecorator).toHaveBeenCalledWith(TestDecorator, methodName);
      expect((service as any).getAspectOrderDecorator).toHaveBeenCalledWith(mockDecorators[0]);
    });

    it('should throw AOPError decorators with order when decorators exist and have non-number order', () => {
      class TestDecorator {
        testMethod() {}
      }
      const mockDecorators = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator },
      ];

      const methodName = 'testMethod';
      jest.spyOn(service as any, 'getAspectDecorator').mockReturnValue(mockDecorators);

      // Mock Reflect.getMetadata to return a string (invalid order)
      const originalGetMetadata = Reflect.getMetadata;
      Reflect.getMetadata = jest.fn().mockReturnValue('1');

      expect(() => {
        (service as any).getDecorators(TestDecorator, methodName);
      }).toThrow(AOPError);

      // Restore original function
      Reflect.getMetadata = originalGetMetadata;
    });

    it('should throw AOPError when decorator has no order metadata', () => {
      class TestDecorator {
        testMethod() {}
      }
      const mockDecorators = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator },
      ];

      jest.spyOn(service as any, 'getAspectDecorator').mockReturnValue(mockDecorators);

      // Mock Reflect.getMetadata to return undefined
      const originalGetMetadata = Reflect.getMetadata;
      Reflect.getMetadata = jest.fn().mockReturnValue(undefined);

      expect(() => {
        (service as any).getDecorators(TestDecorator, 'testMethod');
      }).toThrow(AOPError);

      // Restore original function
      Reflect.getMetadata = originalGetMetadata;
    });

    it('should throw AOPError when any decorator has no order metadata', () => {
      class TestDecorator {
        testMethod() {}
      }
      const mockDecorators = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator },
        { type: AOP_TYPES.AFTER, options: {}, decoratorClass: TestDecorator },
      ];

      jest.spyOn(service as any, 'getAspectDecorator').mockReturnValue(mockDecorators);

      // Mock Reflect.getMetadata to return a number for first call, undefined for second
      const originalGetMetadata = Reflect.getMetadata;
      Reflect.getMetadata = jest
        .fn()
        .mockReturnValueOnce(1) // First decorator has valid order
        .mockReturnValueOnce(undefined); // Second decorator has no order

      expect(() => {
        (service as any).getDecorators(TestDecorator, 'testMethod');
      }).toThrow(AOPError);

      // Restore original function
      Reflect.getMetadata = originalGetMetadata;
    });
  });
});
