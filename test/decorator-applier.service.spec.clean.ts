import { Test, TestingModule } from '@nestjs/testing';
import { SAOPModule } from '../src/saop.module';
import { DecoratorApplier } from '../src/services/decorator-applier.service';
import { LoggingDecorator } from './app/logging.decorator';

describe('DecoratorApplierService', () => {
  let module: TestingModule;
  let decoratorApplier: DecoratorApplier;
  let loggingDecorator: LoggingDecorator;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [SAOPModule.forRoot()],
      providers: [LoggingDecorator],
    }).compile();

    decoratorApplier = module.get(DecoratorApplier);
    loggingDecorator = module.get(LoggingDecorator);
  });

  describe('applyDecorators', () => {
    it('should apply before decorator when method is defined', () => {
      // Create instance with a proper prototype
      const prototype = {};
      const mockInstance = Object.create(prototype);
      const mockMethod = () => 'original result';

      // Set up the prototype descriptor
      Object.defineProperty(prototype, 'testMethod', {
        value: mockMethod,
        configurable: true,
        enumerable: true,
      });

      // Use actual LoggingDecorator
      const mockDecorators = [{ type: 'before', options: { test: 'option' } }];
      const mockSAOPDecorators = [loggingDecorator];

      // Spy on console.log to capture LoggingDecorator output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      decoratorApplier.applyDecorators(
        mockInstance,
        'testMethod',
        mockDecorators,
        mockSAOPDecorators,
        mockMethod,
      );

      // Test that the new descriptor value is a function
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'testMethod');
      expect(typeof descriptor?.value).toBe('function');

      // Call the new function and verify it calls both before and original
      const newFunction = descriptor?.value as Function;
      const result = newFunction('arg1', 'arg2');

      expect(result).toBe('original result');

      // Verify that before decorator was called
      expect(consoleSpy).toHaveBeenCalledWith('Before: Method called with', 'arg1', 'arg2');

      consoleSpy.mockRestore();
    });

    it('should apply after decorator when method is defined', () => {
      // Create instance with a proper prototype
      const prototype = {};
      const mockInstance = Object.create(prototype);
      const mockMethod = () => 'original result';

      // Set up the prototype descriptor
      Object.defineProperty(prototype, 'testMethod', {
        value: mockMethod,
        configurable: true,
        enumerable: true,
      });

      // Use actual LoggingDecorator
      const mockDecorators = [{ type: 'after', options: { test: 'option' } }];
      const mockSAOPDecorators = [loggingDecorator];

      // Spy on console.log to capture LoggingDecorator output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      decoratorApplier.applyDecorators(
        mockInstance,
        'testMethod',
        mockDecorators,
        mockSAOPDecorators,
        mockMethod,
      );

      // Test that the new descriptor value is a function
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'testMethod');
      expect(typeof descriptor?.value).toBe('function');

      // Call the new function and verify it calls both original and after
      const newFunction = descriptor?.value as Function;
      const result = newFunction('arg1', 'arg2');

      expect(result).toBe('original result');

      // Verify that after decorator was called
      expect(consoleSpy).toHaveBeenCalledWith('After: Method completed');

      consoleSpy.mockRestore();
    });

    it('should apply afterReturning decorator when method is defined', () => {
      // Create instance with a proper prototype
      const prototype = {};
      const mockInstance = Object.create(prototype);
      const mockMethod = () => 'original result';

      // Set up the prototype descriptor
      Object.defineProperty(prototype, 'testMethod', {
        value: mockMethod,
        configurable: true,
        enumerable: true,
      });

      // Use actual LoggingDecorator
      const mockDecorators = [{ type: 'afterReturning', options: { test: 'option' } }];
      const mockSAOPDecorators = [loggingDecorator];

      // Spy on console.log to capture LoggingDecorator output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      decoratorApplier.applyDecorators(
        mockInstance,
        'testMethod',
        mockDecorators,
        mockSAOPDecorators,
        mockMethod,
      );

      // Call the new function first to trigger afterReturning
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'testMethod');
      const newFunction = descriptor?.value as Function;
      const result = newFunction('arg1', 'arg2');

      expect(result).toBe('original result');

      // Verify that afterReturning decorator was called
      expect(consoleSpy).toHaveBeenCalledWith('AfterReturning: Method returned', 'original result');

      consoleSpy.mockRestore();
    });

    it('should apply afterThrowing decorator when method is defined', () => {
      // Create instance with a proper prototype
      const prototype = {};
      const mockInstance = Object.create(prototype);
      const mockMethod = () => {
        throw new Error('Test error');
      };

      // Set up the prototype descriptor
      Object.defineProperty(prototype, 'testMethod', {
        value: mockMethod,
        configurable: true,
        enumerable: true,
      });

      // Use actual LoggingDecorator
      const mockDecorators = [{ type: 'afterThrowing', options: { test: 'option' } }];
      const mockSAOPDecorators = [loggingDecorator];

      // Spy on console.log to capture LoggingDecorator output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      decoratorApplier.applyDecorators(
        mockInstance,
        'testMethod',
        mockDecorators,
        mockSAOPDecorators,
        mockMethod,
      );

      // Test that the new descriptor value is a function
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'testMethod');
      expect(typeof descriptor?.value).toBe('function');

      // Call the new function and verify it handles errors correctly
      const newFunction = descriptor?.value as Function;
      expect(() => newFunction('arg1', 'arg2')).toThrow('Test error');

      // Verify that afterThrowing decorator was called
      expect(consoleSpy).toHaveBeenCalledWith('AfterThrowing: Method threw', 'Test error');

      consoleSpy.mockRestore();
    });
  });
});
