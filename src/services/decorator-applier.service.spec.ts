import { AOP_TYPES, AOPDecoratorMetadataWithOrder, type IAOPDecorator } from '../interfaces';
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

      const decorators: AOPDecoratorMetadataWithOrder[] = [
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

    it('should execute decorators in Spring AOP order (Around -> Before -> Method -> AfterReturning -> After)', () => {
      class TestClass {
        testMethod() {
          executionOrder.push('Method');
          return 'method-result';
        }
      }

      const instance = new TestClass();
      const methodName = 'testMethod';
      const originalMethod = instance.testMethod;
      const executionOrder: string[] = [];

      class MockAroundDecorator implements IAOPDecorator {
        around({ proceed }: any) {
          return (...args: any[]) => {
            executionOrder.push('Around-start');
            const result = proceed(...args);
            executionOrder.push('Around-end');
            return result;
          };
        }
      }

      class MockBeforeDecorator implements IAOPDecorator {
        before() {
          return () => executionOrder.push('Before');
        }
      }

      class MockAfterDecorator implements IAOPDecorator {
        after() {
          return () => executionOrder.push('After');
        }
      }

      class MockAfterReturningDecorator implements IAOPDecorator {
        afterReturning() {
          return () => executionOrder.push('AfterReturning');
        }
      }

      const aroundDecorator = new MockAroundDecorator();
      const beforeDecorator = new MockBeforeDecorator();
      const afterDecorator = new MockAfterDecorator();
      const afterReturningDecorator = new MockAfterReturningDecorator();

      const decorators: AOPDecoratorMetadataWithOrder[] = [
        {
          decoratorClass: MockAroundDecorator,
          type: AOP_TYPES.AROUND,
          options: {},
          order: 0,
        },
        {
          decoratorClass: MockBeforeDecorator,
          type: AOP_TYPES.BEFORE,
          options: {},
          order: 0,
        },
        {
          decoratorClass: MockAfterDecorator,
          type: AOP_TYPES.AFTER,
          options: {},
          order: 0,
        },
        {
          decoratorClass: MockAfterReturningDecorator,
          type: AOP_TYPES.AFTER_RETURNING,
          options: {},
          order: 0,
        },
      ];

      const aopDecorators = [
        aroundDecorator,
        beforeDecorator,
        afterDecorator,
        afterReturningDecorator,
      ];

      service.applyDecorators({
        instance,
        methodName,
        decorators,
        aopDecorators,
        originalMethod,
      });

      const newMethod = instance.testMethod;
      newMethod.call(instance);

      // AOP execution order: Around -> Before -> Method -> AfterReturning -> After
      expect(executionOrder).toEqual([
        'Around-start',
        'Before',
        'Method',
        'AfterReturning',
        'After',
        'Around-end',
      ]);
    });

    it('should handle decorator without decoratorClass gracefully', () => {
      const instance = {};
      const methodName = 'testMethod';
      const originalMethod = jest.fn();

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

      // Should not throw and handle gracefully
      expect(() => descriptor.value.call(instance)).not.toThrow();
    });

    it('should handle no matching decorator instance gracefully', () => {
      const instance = {};
      class UnrelatedDecorator {}
      const methodName = 'testMethod';
      const originalMethod = jest.fn();
      const descriptor = { value: originalMethod, configurable: true };

      Object.defineProperty(Object.getPrototypeOf(instance), methodName, descriptor);

      const decorators: AOPDecoratorMetadataWithOrder[] = [
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

      // Should not throw and handle gracefully
      expect(() => descriptor.value.call(instance)).not.toThrow();
    });

    it('should handle wrong methodName', () => {
      class TestClass {
        testMethod() {}
      }

      const instance = new TestClass();
      const methodName = 'nonExistentMethod';
      const originalMethod = jest.fn();

      const decorators: AOPDecoratorMetadataWithOrder[] = [
        { type: AOP_TYPES.BEFORE, options: {}, order: 0, decoratorClass: TestClass },
      ];
      const aopDecorators: IAOPDecorator[] = [];

      expect(() => {
        service.applyDecorators({
          instance,
          methodName,
          decorators,
          aopDecorators,
          originalMethod,
        });
      }).not.toThrow();
    });

    it('should handle multiple decorators of same type', () => {
      class TestClass {
        testMethod() {}
      }

      const instance = new TestClass();
      const methodName = 'testMethod';
      const originalMethod = instance.testMethod;

      class MockAOPDecorator1 implements IAOPDecorator {
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
          return jest.fn();
        }
      }

      class MockAOPDecorator2 implements IAOPDecorator {
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
          return jest.fn();
        }
      }

      const mockDecorator1 = new MockAOPDecorator1();
      const mockDecorator2 = new MockAOPDecorator2();
      jest.spyOn(mockDecorator1, 'before');
      jest.spyOn(mockDecorator2, 'before');

      const decorators: AOPDecoratorMetadataWithOrder[] = [
        {
          decoratorClass: MockAOPDecorator1,
          type: AOP_TYPES.BEFORE,
          options: {},
          order: 0,
        },
        {
          decoratorClass: MockAOPDecorator2,
          type: AOP_TYPES.BEFORE,
          options: {},
          order: 1,
        },
      ];

      const aopDecorators = [mockDecorator1, mockDecorator2];

      service.applyDecorators({
        instance,
        methodName,
        decorators,
        aopDecorators,
        originalMethod,
      });

      const newMethod = instance.testMethod;
      newMethod.call(instance);

      expect(mockDecorator1.before).toHaveBeenCalled();
      expect(mockDecorator2.before).toHaveBeenCalled();
    });

    it('should handle undefined decorator options', () => {
      class TestClass {
        testMethod() {}
      }

      const instance = new TestClass();
      const methodName = 'testMethod';
      const originalMethod = instance.testMethod;

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
          return jest.fn();
        }
      }

      const mockDecorator = new MockAOPDecorator();
      jest.spyOn(mockDecorator, 'before');

      const decorators: AOPDecoratorMetadataWithOrder[] = [
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.BEFORE,
          options: undefined as any,
          order: 0,
        },
      ];

      const aopDecorators = [mockDecorator];

      service.applyDecorators({
        instance,
        methodName,
        decorators,
        aopDecorators,
        originalMethod,
      });

      const newMethod = instance.testMethod;
      newMethod.call(instance);

      expect(mockDecorator.before).toHaveBeenCalledWith({
        method: originalMethod,
        options: undefined,
      });
    });

    it('should handle null instance', () => {
      const instance = null;
      const methodName = 'testMethod';
      const originalMethod = jest.fn();

      const decorators: AOPDecoratorMetadataWithOrder[] = [
        { type: AOP_TYPES.BEFORE, options: {}, order: 0, decoratorClass: {} as any },
      ];
      const aopDecorators: IAOPDecorator[] = [];

      expect(() => {
        service.applyDecorators({
          instance,
          methodName,
          decorators,
          aopDecorators,
          originalMethod,
        });
      }).toThrow('Cannot convert undefined or null to object');
    });

    it('should handle undefined originalMethod', () => {
      const instance = {};
      const methodName = 'testMethod';
      const originalMethod = undefined as any;

      const decorators: AOPDecoratorMetadataWithOrder[] = [
        { type: AOP_TYPES.BEFORE, options: {}, order: 0, decoratorClass: {} as any },
      ];
      const aopDecorators: IAOPDecorator[] = [];

      expect(() => {
        service.applyDecorators({
          instance,
          methodName,
          decorators,
          aopDecorators,
          originalMethod,
        });
      }).not.toThrow();
    });
  });

  describe('findTargetDecorator', () => {
    it('should find matching decorator instance', () => {
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
          return jest.fn();
        }
      }

      const mockDecorator = new MockAOPDecorator();
      const aopDecorators = [mockDecorator];
      const decorator: AOPDecoratorMetadataWithOrder = {
        decoratorClass: MockAOPDecorator,
        type: AOP_TYPES.BEFORE,
        options: {},
        order: 0,
      };

      const result = (service as any).findTargetDecorator({
        decorator,
        aopDecorators,
        methodName: 'testMethod',
      });

      expect(result).toBe(mockDecorator);
    });

    it('should return null if no matching decorator found', () => {
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
          return jest.fn();
        }
      }

      class OtherDecorator {}
      const mockDecorator = new MockAOPDecorator();
      const aopDecorators = [mockDecorator];
      const decorator: AOPDecoratorMetadataWithOrder = {
        decoratorClass: OtherDecorator,
        type: AOP_TYPES.BEFORE,
        options: {},
        order: 0,
      };

      const result = (service as any).findTargetDecorator({
        decorator,
        aopDecorators,
        methodName: 'testMethod',
      });

      expect(result).toBeNull();
    });

    it('should return null if decorator has no decoratorClass', () => {
      const aopDecorators: IAOPDecorator[] = [];
      const decorator = {
        type: AOP_TYPES.BEFORE,
        options: {},
        order: 0,
      } as any;

      const result = (service as any).findTargetDecorator({
        decorator,
        aopDecorators,
        methodName: 'testMethod',
      });

      expect(result).toBeNull();
    });

    it('should handle empty methodName in findTargetDecorator', () => {
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
          return jest.fn();
        }
      }

      const mockDecorator = new MockAOPDecorator();
      const aopDecorators = [mockDecorator];
      const decorator: AOPDecoratorMetadataWithOrder = {
        decoratorClass: MockAOPDecorator,
        type: AOP_TYPES.BEFORE,
        options: {},
        order: 0,
      };

      const result = (service as any).findTargetDecorator({
        decorator,
        aopDecorators,
        methodName: '',
      });

      expect(result).toBe(mockDecorator);
    });

    it('should handle special characters in methodName', () => {
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
          return jest.fn();
        }
      }

      const mockDecorator = new MockAOPDecorator();
      const aopDecorators = [mockDecorator];
      const decorator: AOPDecoratorMetadataWithOrder = {
        decoratorClass: MockAOPDecorator,
        type: AOP_TYPES.BEFORE,
        options: {},
        order: 0,
      };

      const result = (service as any).findTargetDecorator({
        decorator,
        aopDecorators,
        methodName: 'test-method_with.special:chars',
      });

      expect(result).toBe(mockDecorator);
    });
  });

  describe('combineChains', () => {
    it('should execute Spring AOP style execution flow', () => {
      const instance = {};
      const originalMethod = jest.fn().mockReturnValue('result');

      const chains = {
        [AOP_TYPES.AROUND]: originalMethod, // Final execution in AOP
        [AOP_TYPES.BEFORE]: undefined,
        [AOP_TYPES.AFTER]: undefined,
        [AOP_TYPES.AFTER_RETURNING]: undefined,
        [AOP_TYPES.AFTER_THROWING]: undefined,
      };

      const combinedMethod = (service as any).combineChains({
        chains,
        originalMethod,
        instance,
      });

      const result = combinedMethod('arg1', 'arg2');

      expect(result).toBe('result');
      expect(originalMethod).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle around chain execution', () => {
      const aroundSpy = jest.fn().mockReturnValue('around-result');
      const instance = {};
      const originalMethod = jest.fn();

      const chains = {
        [AOP_TYPES.AROUND]: aroundSpy,
        [AOP_TYPES.BEFORE]: undefined,
        [AOP_TYPES.AFTER]: undefined,
        [AOP_TYPES.AFTER_RETURNING]: undefined,
        [AOP_TYPES.AFTER_THROWING]: undefined,
      };

      const combinedMethod = (service as any).combineChains({
        chains,
        originalMethod,
        instance,
      });

      const result = combinedMethod('arg1', 'arg2');

      expect(result).toBe('around-result');
      expect(aroundSpy).toHaveBeenCalledWith('arg1', 'arg2');
      expect(originalMethod).not.toHaveBeenCalled(); // Around wraps everything
    });

    it('should fallback to original method when no Around chain exists', () => {
      const instance = {};
      const originalMethod = jest.fn().mockReturnValue('result');

      const chains = {
        [AOP_TYPES.AROUND]: undefined, // No Around chain
        [AOP_TYPES.BEFORE]: undefined,
        [AOP_TYPES.AFTER]: undefined,
        [AOP_TYPES.AFTER_RETURNING]: undefined,
        [AOP_TYPES.AFTER_THROWING]: undefined,
      };

      const combinedMethod = (service as any).combineChains({
        chains,
        originalMethod,
        instance,
      });

      const result = combinedMethod('arg1', 'arg2');

      expect(result).toBe('result');
      expect(originalMethod).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });
});
