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
      } as any;

      jest.spyOn(Reflect, 'getMetadata').mockImplementation((key, target, propertyKey) => {
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

      expect(result.methods).toEqual(expectMetadata);
      expect(result.metatype).toBe(TestClass);
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
      } as any;

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      const result = service.processInstanceMethods(wrapper);

      expect(result.methods).toEqual([]);
      expect(result.metatype).toBe(TestClass);
    });

    it('should handle invalid wrapper', () => {
      const wrapper = { instance: null, metatype: null } as any;

      const result = service.processInstanceMethods(wrapper);

      expect(result.methods).toEqual([]);
      expect(result.metatype).toBeNull();
    });

    it('should handle class with no prototype methods', () => {
      class TestClass {}

      const wrapper = {
        instance: new TestClass(),
        metatype: TestClass,
      };

      const result = service.processInstanceMethods(wrapper as any);

      expect(result.methods).toEqual([]);
      expect(result.metatype).toBe(TestClass);
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
      } as any;

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

      expect(result.methods).toHaveLength(1);
      expect(result.methods[0]!.methodName).toBe('method1');
      expect(result.metatype).toBe(TestClass);
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

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue('1');

      expect(() => {
        (service as any).getDecorators(TestDecorator, methodName);
      }).toThrow(AOPError);
    });

    it('should throw AOPError when decorator has no order metadata', () => {
      class TestDecorator {
        testMethod() {}
      }
      const mockDecorators = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator },
      ];

      jest.spyOn(service as any, 'getAspectDecorator').mockReturnValue(mockDecorators);
      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      expect(() => {
        (service as any).getDecorators(TestDecorator, 'testMethod');
      }).toThrow(AOPError);
    });

    it('should return undefined when no decorators exist', () => {
      const methodName = 'testMethod';
      jest.spyOn(service as any, 'getAspectDecorator').mockReturnValue(undefined);

      const result = (service as any).getDecorators({}, methodName);

      expect(result).toBeUndefined();
      expect((service as any).getAspectDecorator).toHaveBeenCalledWith({}, methodName);
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

      jest
        .spyOn(Reflect, 'getMetadata')
        .mockReturnValueOnce(1) // First decorator has valid order
        .mockReturnValueOnce(undefined); // Second decorator has no order

      expect(() => {
        (service as any).getDecorators(TestDecorator, 'testMethod');
      }).toThrow(AOPError);
    });
  });
});
