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

    it('should apply around decorator when method is defined', () => {
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
      const mockDecorators = [{ type: 'around', options: { test: 'option' } }];
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

      // Call the new function and verify it calls around decorator
      const newFunction = descriptor?.value as Function;
      const result = newFunction('arg1', 'arg2');

      expect(result).toBe('original result');

      // Verify that around decorator was called
      expect(consoleSpy).toHaveBeenCalledWith('Around: Before method call', 'arg1', 'arg2');
      expect(consoleSpy).toHaveBeenCalledWith('Around: After method call', 'original result');

      consoleSpy.mockRestore();
    });

    it('should handle afterThrowing decorator when no exception is thrown', () => {
      // Create instance with a proper prototype
      const prototype = {};
      const mockInstance = Object.create(prototype);
      const mockMethod = () => 'success result';

      // Set up the prototype descriptor
      Object.defineProperty(prototype, 'testMethod', {
        value: mockMethod,
        configurable: true,
        enumerable: true,
      });

      // Use actual LoggingDecorator
      const mockDecorators = [{ type: 'afterThrowing', options: { test: 'option' } }];
      const mockSAOPDecorators = [loggingDecorator];

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

      // Call the new function and verify it works normally when no exception
      const newFunction = descriptor?.value as Function;
      const result = newFunction('arg1', 'arg2');

      expect(result).toBe('success result');
    });

    it('should handle when descriptor is not found', () => {
      // Create instance with a proper prototype but no method defined
      const prototype = {};
      const mockInstance = Object.create(prototype);
      const mockMethod = () => 'original result';

      // Don't set up the prototype descriptor - this should test the case where descriptor is not found

      // Use actual LoggingDecorator
      const mockDecorators = [{ type: 'before', options: { test: 'option' } }];
      const mockSAOPDecorators = [loggingDecorator];

      // This should not throw and should handle gracefully
      expect(() => {
        decoratorApplier.applyDecorators(
          mockInstance,
          'nonExistentMethod',
          mockDecorators,
          mockSAOPDecorators,
          mockMethod,
        );
      }).not.toThrow();

      // Verify that no descriptor was created
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'nonExistentMethod');
      expect(descriptor).toBeUndefined();
    });

    it('should handle when saopDecorator has no before method', () => {
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

      // Create a mock decorator without before method
      const mockDecoratorWithoutBefore = {
        after: jest.fn().mockReturnValue(() => {}),
        afterReturning: jest.fn().mockReturnValue(() => {}),
        afterThrowing: jest.fn().mockReturnValue(() => {}),
        around: jest.fn().mockReturnValue(() => 'wrapped'),
      };

      const mockDecorators = [{ type: 'before', options: { test: 'option' } }];
      const mockSAOPDecorators = [mockDecoratorWithoutBefore];

      decoratorApplier.applyDecorators(
        mockInstance,
        'testMethod',
        mockDecorators,
        mockSAOPDecorators,
        mockMethod,
      );

      // Test that the descriptor value remains unchanged when decorator method doesn't exist
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'testMethod');
      expect(descriptor?.value).toBe(mockMethod);
    });

    it('should handle when saopDecorator has no after method', () => {
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

      // Create a mock decorator without after method
      const mockDecoratorWithoutAfter = {
        before: jest.fn().mockReturnValue(() => {}),
        afterReturning: jest.fn().mockReturnValue(() => {}),
        afterThrowing: jest.fn().mockReturnValue(() => {}),
        around: jest.fn().mockReturnValue(() => 'wrapped'),
      };

      const mockDecorators = [{ type: 'after', options: { test: 'option' } }];
      const mockSAOPDecorators = [mockDecoratorWithoutAfter];

      decoratorApplier.applyDecorators(
        mockInstance,
        'testMethod',
        mockDecorators,
        mockSAOPDecorators,
        mockMethod,
      );

      // Test that the descriptor value remains unchanged when decorator method doesn't exist
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'testMethod');
      expect(descriptor?.value).toBe(mockMethod);
    });

    it('should handle when saopDecorator has no afterReturning method', () => {
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

      // Create a mock decorator without afterReturning method
      const mockDecoratorWithoutAfterReturning = {
        before: jest.fn().mockReturnValue(() => {}),
        after: jest.fn().mockReturnValue(() => {}),
        afterThrowing: jest.fn().mockReturnValue(() => {}),
        around: jest.fn().mockReturnValue(() => 'wrapped'),
      };

      const mockDecorators = [{ type: 'afterReturning', options: { test: 'option' } }];
      const mockSAOPDecorators = [mockDecoratorWithoutAfterReturning];

      decoratorApplier.applyDecorators(
        mockInstance,
        'testMethod',
        mockDecorators,
        mockSAOPDecorators,
        mockMethod,
      );

      // Test that the descriptor value remains unchanged when decorator method doesn't exist
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'testMethod');
      expect(descriptor?.value).toBe(mockMethod);
    });

    it('should handle when saopDecorator has no afterThrowing method', () => {
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

      // Create a mock decorator without afterThrowing method
      const mockDecoratorWithoutAfterThrowing = {
        before: jest.fn().mockReturnValue(() => {}),
        after: jest.fn().mockReturnValue(() => {}),
        afterReturning: jest.fn().mockReturnValue(() => {}),
        around: jest.fn().mockReturnValue(() => 'wrapped'),
      };

      const mockDecorators = [{ type: 'afterThrowing', options: { test: 'option' } }];
      const mockSAOPDecorators = [mockDecoratorWithoutAfterThrowing];

      decoratorApplier.applyDecorators(
        mockInstance,
        'testMethod',
        mockDecorators,
        mockSAOPDecorators,
        mockMethod,
      );

      // Test that the descriptor value remains unchanged when decorator method doesn't exist
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'testMethod');
      expect(descriptor?.value).toBe(mockMethod);
    });

    it('should handle when saopDecorator has no around method', () => {
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

      // Create a mock decorator without around method
      const mockDecoratorWithoutAround = {
        before: jest.fn().mockReturnValue(() => {}),
        after: jest.fn().mockReturnValue(() => {}),
        afterReturning: jest.fn().mockReturnValue(() => {}),
        afterThrowing: jest.fn().mockReturnValue(() => {}),
      };

      const mockDecorators = [{ type: 'around', options: { test: 'option' } }];
      const mockSAOPDecorators = [mockDecoratorWithoutAround];

      decoratorApplier.applyDecorators(
        mockInstance,
        'testMethod',
        mockDecorators,
        mockSAOPDecorators,
        mockMethod,
      );

      // Test that the descriptor value remains unchanged when decorator method doesn't exist
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'testMethod');
      expect(descriptor?.value).toBe(mockMethod);
    });

    it('should apply decorator when decoratorClass is specified', () => {
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

      // Use decorator with decoratorClass specified
      const mockDecorators = [
        {
          type: 'before',
          options: { test: 'option' },
          decoratorClass: 'LoggingDecorator',
        },
      ];
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

    it('should handle when decoratorClass is specified but decorator not found', () => {
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

      // Use decorator with non-existent decoratorClass
      const mockDecorators = [
        {
          type: 'before',
          options: { test: 'option' },
          decoratorClass: 'NonExistentDecorator',
        },
      ];
      const mockSAOPDecorators = [loggingDecorator];

      decoratorApplier.applyDecorators(
        mockInstance,
        'testMethod',
        mockDecorators,
        mockSAOPDecorators,
        mockMethod,
      );

      // Test that the descriptor value remains unchanged when decorator is not found
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'testMethod');
      expect(descriptor?.value).toBe(mockMethod);
    });
  });
});
