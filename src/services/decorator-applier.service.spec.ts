import { AOP_TYPES, AOPDecoratorMetadata, type IAOPDecorator } from '../interfaces';
import { logger } from '../utils/aop-logger';
import { DecoratorApplier } from './decorator-applier.service';

describe('DecoratorApplier', () => {
  let service: DecoratorApplier;

  beforeEach(() => {
    service = new DecoratorApplier();
  });

  describe('applyDecorators', () => {
    it('should apply multiple decorators correctly', () => {
      class TestClass {
        testMethod() {}
      }

      const instance = new TestClass();
      const methodName = 'testMethod';
      const originalMethod = instance.testMethod;
      const descriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(instance),
        methodName,
      );
      // Check that methodName exists on the prototype (for test development)
      if (!descriptor) throw new Error('Descriptor not found');

      class MockAOPDecorator implements IAOPDecorator {
        before() {
          return jest.fn();
        }
        after() {
          return jest.fn();
        }
        afterReturning() {
          return jest.fn();
        }
        afterThrowing() {
          return jest.fn();
        }
        around() {
          return jest.fn().mockReturnValue('around result');
        }
      }
      const mockAOPDecorator = new MockAOPDecorator();
      jest.spyOn(mockAOPDecorator, 'before');
      jest.spyOn(mockAOPDecorator, 'after');

      const decorators: AOPDecoratorMetadata[] = [
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.BEFORE,
          options: {},
          order: 0,
        },
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.AFTER,
          options: {},
          order: 0,
        },
      ];

      const aopDecorators = [mockAOPDecorator];

      service.applyDecorators({
        instance,
        methodName,
        decorators,
        aopDecorators,
        originalMethod,
      });

      const newMethod = instance.testMethod;
      newMethod.call(instance);

      expect(mockAOPDecorator.before).toHaveBeenCalled();
      expect(mockAOPDecorator.after).toHaveBeenCalled();
    });

    it('should sort by smaller order value', () => {
      class TestClass {
        testMethod() {}
      }

      const instance = new TestClass();
      const methodName = 'testMethod';
      const originalMethod = instance.testMethod;
      const descriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(instance),
        methodName,
      );
      // Check that methodName exists on the prototype (for test development)
      if (!descriptor) throw new Error('Descriptor not found');

      class MockAOPDecorator1 implements IAOPDecorator {
        before() {
          orderedCalls.push(1);
          return jest.fn();
        }
      }
      class MockAOPDecorator2 implements IAOPDecorator {
        before() {
          orderedCalls.push(2);
          return jest.fn();
        }
      }
      const orderedCalls: number[] = [];
      const mockAOPDecorator1 = new MockAOPDecorator1();
      const mockAOPDecorator2 = new MockAOPDecorator2();

      const decorators: AOPDecoratorMetadata[] = [
        {
          decoratorClass: MockAOPDecorator1,
          type: AOP_TYPES.BEFORE,
          options: {},
          order: 1,
        },
        {
          decoratorClass: MockAOPDecorator2,
          type: AOP_TYPES.BEFORE,
          options: {},
          order: 2,
        },
      ];

      const aopDecorators = [mockAOPDecorator1, mockAOPDecorator2];

      service.applyDecorators({
        instance,
        methodName,
        decorators,
        aopDecorators,
        originalMethod,
      });

      const newMethod = instance.testMethod;
      newMethod.call(instance);

      expect(orderedCalls).toEqual([1, 2]);
    });

    it('should warn if decorator has no decoratorClass', () => {
      const instance = {};
      const methodName = 'testMethod';
      const originalMethod = jest.fn();
      jest.mocked(logger).warn = jest.fn();

      const descriptor = { value: originalMethod, configurable: true };

      Object.defineProperty(Object.getPrototypeOf(instance), methodName, descriptor);

      const decorators = [{ type: AOP_TYPES.BEFORE, options: {}, order: 0 }] as any[];
      const aopDecorators: IAOPDecorator[] = [];

      service.applyDecorators({
        instance,
        methodName,
        decorators,
        aopDecorators,
        originalMethod,
      });

      expect(logger.warn).toHaveBeenCalled();
    });

    it('should warn if no matching decorator instance found', () => {
      const instance = {};
      class UnrelatedDecorator {}
      const methodName = 'testMethod';
      const originalMethod = jest.fn();
      const descriptor = { value: originalMethod, configurable: true };
      jest.mocked(logger).warn = jest.fn();

      Object.defineProperty(Object.getPrototypeOf(instance), methodName, descriptor);

      const decorators: AOPDecoratorMetadata[] = [
        { decoratorClass: UnrelatedDecorator, type: AOP_TYPES.BEFORE, options: {}, order: 0 },
      ];
      const aopDecorators: IAOPDecorator[] = [];

      service.applyDecorators({
        instance,
        methodName,
        decorators,
        aopDecorators,
        originalMethod,
      });

      expect(logger.warn).toHaveBeenCalled();
    });

    it('should handle wrong methodName', () => {
      class TestClass {
        testMethod() {}
      }

      const instance = new TestClass();
      const methodName = 'nonExistentMethod';
      const originalMethod = jest.fn();

      const decorators: AOPDecoratorMetadata[] = [
        { type: AOP_TYPES.BEFORE, options: {}, order: 0, decoratorClass: TestClass },
      ];
      const aopDecorators: IAOPDecorator[] = [];
      jest.mocked(logger).warn = jest.fn();

      service.applyDecorators({
        instance,
        methodName,
        decorators,
        aopDecorators,
        originalMethod,
      });

      // aopDecorators is empty, so if it can't handle wrong methodName, warning will be logged
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should handle empty decorators array', () => {
      const instance = {};
      const methodName = 'testMethod';
      const originalMethod = jest.fn();
      const descriptor = { value: originalMethod, configurable: true };

      Object.defineProperty(Object.getPrototypeOf(instance), methodName, descriptor);

      service.applyDecorators({
        instance,
        methodName,
        decorators: [],
        aopDecorators: [],
        originalMethod,
      });

      // No changes expected
      expect(descriptor.value).toBe(originalMethod);
    });
  });

  describe('applySingleDecorator', () => {
    it('should apply BEFORE type decorator', () => {
      const mockAOPDecorator: IAOPDecorator = {
        before: jest.fn().mockReturnValue(jest.fn()),
      };
      const descriptor = { value: jest.fn(), configurable: true };
      const instance = {};
      const originalMethod = jest.fn();
      const decorator: AOPDecoratorMetadata = {
        type: AOP_TYPES.BEFORE,
        options: {},
        order: 0,
        decoratorClass: {} as any,
      };

      service['applySingleDecorator']({
        aopDecorator: mockAOPDecorator,
        descriptor,
        instance,
        originalMethod,
        decorator,
      });

      const newMethod = descriptor.value;
      newMethod('arg1', 'arg2');

      expect(mockAOPDecorator.before).toHaveBeenCalledWith({
        method: originalMethod,
        options: {},
      });
    });

    it('should apply AFTER type decorator', () => {
      const mockAOPDecorator: IAOPDecorator = {
        after: jest.fn().mockReturnValue(jest.fn()),
      };
      const descriptor = { value: jest.fn().mockReturnValue('result'), configurable: true };
      const instance = {};
      const originalMethod = jest.fn();
      const decorator: AOPDecoratorMetadata = {
        type: AOP_TYPES.AFTER,
        options: {},
        order: 0,
        decoratorClass: {} as any,
      };

      service['applySingleDecorator']({
        aopDecorator: mockAOPDecorator,
        descriptor,
        instance,
        originalMethod,
        decorator,
      });

      const newMethod = descriptor.value;
      const result = newMethod('arg1', 'arg2');

      expect(result).toBe('result');
      expect(mockAOPDecorator.after).toHaveBeenCalledWith({
        method: originalMethod,
        options: {},
      });
    });

    it('should apply AFTER_RETURNING type decorator', () => {
      const mockAOPDecorator: IAOPDecorator = {
        afterReturning: jest.fn().mockReturnValue(jest.fn()),
      };
      const descriptor = { value: jest.fn().mockReturnValue('result'), configurable: true };
      const instance = {};
      const originalMethod = jest.fn();
      const decorator: AOPDecoratorMetadata = {
        type: AOP_TYPES.AFTER_RETURNING,
        options: {},
        order: 0,
        decoratorClass: {} as any,
      };

      service['applySingleDecorator']({
        aopDecorator: mockAOPDecorator,
        descriptor,
        instance,
        originalMethod,
        decorator,
      });

      const newMethod = descriptor.value;
      const result = newMethod('arg1', 'arg2');

      expect(result).toBe('result');
      expect(mockAOPDecorator.afterReturning).toHaveBeenCalledWith({
        method: originalMethod,
        options: {},
        result: 'result',
      });
    });

    it('should apply AFTER_THROWING type decorator', () => {
      const mockAOPDecorator: IAOPDecorator = {
        afterThrowing: jest.fn().mockReturnValue(jest.fn()),
      };
      const descriptor = {
        value: jest.fn().mockImplementation(() => {
          throw new Error('test error');
        }),
        configurable: true,
      };
      const instance = {};
      const originalMethod = jest.fn();
      const decorator: AOPDecoratorMetadata = {
        type: AOP_TYPES.AFTER_THROWING,
        options: {},
        order: 0,
        decoratorClass: {} as any,
      };

      service['applySingleDecorator']({
        aopDecorator: mockAOPDecorator,
        descriptor,
        instance,
        originalMethod,
        decorator,
      });

      const newMethod = descriptor.value;

      expect(() => newMethod('arg1', 'arg2')).toThrow('test error');
      expect(mockAOPDecorator.afterThrowing).toHaveBeenCalledWith({
        method: originalMethod,
        options: {},
        error: expect.any(Error),
      });
    });

    it('should apply AROUND type decorator', () => {
      const mockAOPDecorator: IAOPDecorator = {
        around: jest.fn().mockReturnValue(jest.fn().mockReturnValue('around result')),
      };
      const descriptor = { value: jest.fn(), configurable: true };
      const instance = {};
      const originalMethod = jest.fn();
      const decorator: AOPDecoratorMetadata = {
        type: AOP_TYPES.AROUND,
        options: {},
        order: 0,
        decoratorClass: {} as any,
      };

      service['applySingleDecorator']({
        aopDecorator: mockAOPDecorator,
        descriptor,
        instance,
        originalMethod,
        decorator,
      });

      const newMethod = descriptor.value;
      const result = newMethod('arg1', 'arg2');

      expect(result).toBe('around result');
      expect(mockAOPDecorator.around).toHaveBeenCalledWith({
        method: expect.any(Function),
        options: {},
      });
    });
  });
});
