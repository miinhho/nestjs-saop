import { AOP_TYPES, type IAOPDecorator } from '../interfaces';
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

      // Check that methodName exists on the prototype (for library development)
      if (!descriptor) throw new Error('Descriptor not found');

      const mockAOPDecorator: IAOPDecorator = {
        before: jest.fn().mockReturnValue(jest.fn()),
        after: jest.fn().mockReturnValue(jest.fn()),
        afterReturning: jest.fn().mockReturnValue(jest.fn()),
        afterThrowing: jest.fn().mockReturnValue(jest.fn()),
        around: jest.fn().mockReturnValue(jest.fn().mockReturnValue('around result')),
      };
      (mockAOPDecorator as any).constructor = { name: 'MockAOPDecorator' };

      const decorators = [
        { decoratorClass: 'MockAOPDecorator', type: AOP_TYPES.BEFORE, options: {} },
        { decoratorClass: 'MockAOPDecorator', type: AOP_TYPES.AFTER, options: {} },
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

    it('should warn if decorator has no decoratorClass', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const instance = {};
      const methodName = 'testMethod';
      const originalMethod = jest.fn();
      const descriptor = { value: originalMethod, configurable: true };

      Object.defineProperty(Object.getPrototypeOf(instance), methodName, descriptor);

      const decorators = [{ type: AOP_TYPES.BEFORE, options: {} }];
      const aopDecorators: IAOPDecorator[] = [];

      service.applyDecorators({
        instance,
        methodName,
        decorators,
        aopDecorators,
        originalMethod,
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Decorator without decoratorClass found'),
      );
      consoleWarnSpy.mockRestore();
    });

    it('should warn if no matching decorator instance found', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const instance = {};
      const methodName = 'testMethod';
      const originalMethod = jest.fn();
      const descriptor = { value: originalMethod, configurable: true };

      Object.defineProperty(Object.getPrototypeOf(instance), methodName, descriptor);

      const decorators = [
        { decoratorClass: 'NonExistentDecorator', type: AOP_TYPES.BEFORE, options: {} },
      ];
      const aopDecorators: IAOPDecorator[] = [];

      service.applyDecorators({
        instance,
        methodName,
        decorators,
        aopDecorators,
        originalMethod,
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No matching decorator instance found'),
      );
      consoleWarnSpy.mockRestore();
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
      const decorator = { type: AOP_TYPES.BEFORE, options: {} };

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
      const decorator = { type: AOP_TYPES.AFTER, options: {} };

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
      const decorator = { type: AOP_TYPES.AFTER_RETURNING, options: {} };

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
      const decorator = { type: AOP_TYPES.AFTER_THROWING, options: {} };

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
      const decorator = { type: AOP_TYPES.AROUND, options: {} };

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
