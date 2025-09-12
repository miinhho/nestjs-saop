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

    it('should sort by smaller order value', () => {
      class TestClass {
        testMethod() {}
      }

      const instance = new TestClass();
      const methodName = 'testMethod';
      const originalMethod = instance.testMethod;

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

      const decorators: AOPDecoratorMetadataWithOrder[] = [
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

      // Should not throw and should handle gracefully
      expect(descriptor.value).toBe(originalMethod);
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

      // Should not throw and should handle gracefully
      expect(descriptor.value).toBe(originalMethod);
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

    it('should handle empty methodName', () => {
      const instance = {};
      const methodName = '';
      const originalMethod = jest.fn();

      const decorators: AOPDecoratorMetadataWithOrder[] = [
        { type: AOP_TYPES.BEFORE, options: {}, order: 0, decoratorClass: {} as any },
      ];
      const aopDecorators: IAOPDecorator[] = [];

      service.applyDecorators({
        instance,
        methodName,
        decorators,
        aopDecorators,
        originalMethod,
      });

      // Should not throw
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

  describe('createAroundChain', () => {
    it('should create around chain correctly', () => {
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
        around({ method }: any) {
          return (...args: any[]) => `around-${method(...args)}`;
        }
      }

      const mockDecorator = new MockAOPDecorator();
      const aopDecorators = [mockDecorator];
      const originalMethod = jest.fn().mockReturnValue('original');
      const decorators: AOPDecoratorMetadataWithOrder[] = [
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.AROUND,
          options: {},
          order: 0,
        },
      ];

      const chain = (service as any).createAroundChain({
        decorators,
        aopDecorators,
        originalMethod,
        methodName: 'testMethod',
      });

      const result = chain('arg1', 'arg2');
      expect(result).toBe('around-original');
      expect(originalMethod).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle empty decorators array in createAroundChain', () => {
      const aopDecorators: IAOPDecorator[] = [];
      const originalMethod = jest.fn().mockReturnValue('original');
      const decorators: AOPDecoratorMetadataWithOrder[] = [];

      const chain = (service as any).createAroundChain({
        decorators,
        aopDecorators,
        originalMethod,
        methodName: 'testMethod',
      });

      const result = chain('arg1', 'arg2');
      expect(result).toBe('original');
      expect(originalMethod).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle decorator without around method', () => {
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
        around: any = undefined; // 실제로 around 메서드가 없는 경우
      }

      const mockDecorator = new MockAOPDecorator();
      const aopDecorators = [mockDecorator];
      const originalMethod = jest.fn().mockReturnValue('original');
      const decorators: AOPDecoratorMetadataWithOrder[] = [
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.AROUND,
          options: {},
          order: 0,
        },
      ];

      const chain = (service as any).createAroundChain({
        decorators,
        aopDecorators,
        originalMethod,
        methodName: 'testMethod',
      });

      const result = chain('arg1', 'arg2');
      expect(result).toBe('original');
      expect(originalMethod).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('createBeforeChain', () => {
    it('should create before chain correctly', () => {
      const beforeSpy = jest.fn();
      class MockAOPDecorator implements IAOPDecorator {
        before() {
          return beforeSpy;
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
      const originalMethod = jest.fn();
      const decorators: AOPDecoratorMetadataWithOrder[] = [
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.BEFORE,
          options: {},
          order: 0,
        },
      ];

      const chain = (service as any).createBeforeChain({
        decorators,
        aopDecorators,
        originalMethod,
        methodName: 'testMethod',
      });

      chain('arg1', 'arg2');
      expect(beforeSpy).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle empty decorators array in createBeforeChain', () => {
      const aopDecorators: IAOPDecorator[] = [];
      const originalMethod = jest.fn();
      const decorators: AOPDecoratorMetadataWithOrder[] = [];

      const chain = (service as any).createBeforeChain({
        decorators,
        aopDecorators,
        originalMethod,
        methodName: 'testMethod',
      });

      // Should not throw
      expect(() => chain('arg1', 'arg2')).not.toThrow();
    });

    it('should handle decorator without before method', () => {
      class MockAOPDecorator implements IAOPDecorator {
        before: any = undefined; // 실제로 before 메서드가 없는 경우
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
      const originalMethod = jest.fn();
      const decorators: AOPDecoratorMetadataWithOrder[] = [
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.BEFORE,
          options: {},
          order: 0,
        },
      ];

      const chain = (service as any).createBeforeChain({
        decorators,
        aopDecorators,
        originalMethod,
        methodName: 'testMethod',
      });

      // Should not throw even if before method is undefined
      expect(() => chain('arg1', 'arg2')).not.toThrow();
    });
  });

  describe('createAfterChain', () => {
    it('should create after chain correctly', () => {
      const afterSpy = jest.fn();
      class MockAOPDecorator implements IAOPDecorator {
        before() {
          return jest.fn();
        }
        after() {
          return afterSpy;
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
      const originalMethod = jest.fn();
      const decorators: AOPDecoratorMetadataWithOrder[] = [
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.AFTER,
          options: {},
          order: 0,
        },
      ];

      const chain = (service as any).createAfterChain({
        decorators,
        aopDecorators,
        originalMethod,
        methodName: 'testMethod',
      });

      chain('arg1', 'arg2');
      expect(afterSpy).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle empty decorators array in createAfterChain', () => {
      const aopDecorators: IAOPDecorator[] = [];
      const originalMethod = jest.fn();
      const decorators: AOPDecoratorMetadataWithOrder[] = [];

      const chain = (service as any).createAfterChain({
        decorators,
        aopDecorators,
        originalMethod,
        methodName: 'testMethod',
      });

      // Should not throw
      expect(() => chain('arg1', 'arg2')).not.toThrow();
    });

    it('should handle decorator without after method', () => {
      class MockAOPDecorator implements IAOPDecorator {
        before() {
          return jest.fn();
        }
        after: any = undefined; // 실제로 after 메서드가 없는 경우
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
      const originalMethod = jest.fn();
      const decorators: AOPDecoratorMetadataWithOrder[] = [
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.AFTER,
          options: {},
          order: 0,
        },
      ];

      const chain = (service as any).createAfterChain({
        decorators,
        aopDecorators,
        originalMethod,
        methodName: 'testMethod',
      });

      // Should not throw even if after method is undefined
      expect(() => chain('arg1', 'arg2')).not.toThrow();
    });
  });

  describe('combineChains', () => {
    it('should combine chains correctly', () => {
      const beforeSpy = jest.fn();
      const afterSpy = jest.fn();
      const instance = {};
      const originalMethod = jest.fn().mockReturnValue('result');

      const chains = {
        [AOP_TYPES.BEFORE]: beforeSpy,
        [AOP_TYPES.AFTER]: afterSpy,
        [AOP_TYPES.AROUND]: undefined,
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
      expect(beforeSpy).toHaveBeenCalledWith('arg1', 'arg2');
      expect(originalMethod).toHaveBeenCalledWith('arg1', 'arg2');
      expect(afterSpy).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle around chain', () => {
      const aroundSpy = jest.fn().mockReturnValue('around-result');
      const instance = {};
      const originalMethod = jest.fn();

      const chains = {
        [AOP_TYPES.BEFORE]: undefined,
        [AOP_TYPES.AFTER]: undefined,
        [AOP_TYPES.AROUND]: aroundSpy,
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
      expect(originalMethod).not.toHaveBeenCalled();
    });

    it('should handle exceptions with after-throwing chain', () => {
      const afterThrowingSpy = jest.fn();
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
          return afterThrowingSpy;
        }
        around() {
          return jest.fn();
        }
      }

      const mockDecorator = new MockAOPDecorator();
      jest.spyOn(mockDecorator, 'afterThrowing');
      const instance = {};
      const originalMethod = jest.fn().mockImplementation(() => {
        throw new Error('test error');
      });

      const decorators: AOPDecoratorMetadataWithOrder[] = [
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.AFTER_THROWING,
          options: {},
          order: 0,
        },
      ];

      const aopDecorators = [mockDecorator];

      const chains = (service as any).createAllChains({
        decoratorsByType: { [AOP_TYPES.AFTER_THROWING]: decorators },
        aopDecorators,
        originalMethod,
        methodName: 'testMethod',
      });

      const combinedMethod = (service as any).combineChains({
        chains,
        originalMethod,
        instance,
      });

      expect(() => combinedMethod('arg1', 'arg2')).toThrow('test error');
      expect(mockDecorator.afterThrowing).toHaveBeenCalledWith({
        method: originalMethod,
        options: {},
        error: expect.any(Error),
      });
      expect(afterThrowingSpy).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle all chains present', () => {
      const beforeSpy = jest.fn();
      const afterSpy = jest.fn();
      const afterReturningSpy = jest.fn();
      const aroundSpy = jest.fn().mockReturnValue('around-result');
      class MockAOPDecorator implements IAOPDecorator {
        before() {
          return beforeSpy;
        }
        after() {
          return afterSpy;
        }
        afterReturning() {
          return afterReturningSpy;
        }
        afterThrowing() {
          return jest.fn();
        }
        around() {
          return aroundSpy;
        }
      }

      const mockDecorator = new MockAOPDecorator();
      jest.spyOn(mockDecorator, 'before');
      jest.spyOn(mockDecorator, 'after');
      jest.spyOn(mockDecorator, 'afterReturning');
      jest.spyOn(mockDecorator, 'around');
      const instance = {};
      const originalMethod = jest.fn();

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
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.AROUND,
          options: {},
          order: 0,
        },
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.AFTER_RETURNING,
          options: {},
          order: 0,
        },
      ];

      const aopDecorators = [mockDecorator];

      const chains = (service as any).createAllChains({
        decoratorsByType: {
          [AOP_TYPES.BEFORE]: [decorators[0]],
          [AOP_TYPES.AFTER]: [decorators[1]],
          [AOP_TYPES.AROUND]: [decorators[2]],
          [AOP_TYPES.AFTER_RETURNING]: [decorators[3]],
          [AOP_TYPES.AFTER_THROWING]: [],
        },
        aopDecorators,
        originalMethod,
        methodName: 'testMethod',
      });

      const combinedMethod = (service as any).combineChains({
        chains,
        originalMethod,
        instance,
      });

      const result = combinedMethod('arg1', 'arg2');

      expect(result).toBe('around-result');
      expect(mockDecorator.before).toHaveBeenCalledWith({
        method: originalMethod,
        options: {},
      });
      expect(mockDecorator.around).toHaveBeenCalledWith({
        method: expect.any(Function),
        options: {},
      });
      expect(mockDecorator.afterReturning).toHaveBeenCalledWith({
        method: originalMethod,
        options: {},
        result: 'around-result',
      });
      expect(mockDecorator.after).toHaveBeenCalledWith({
        method: originalMethod,
        options: {},
      });
      expect(beforeSpy).toHaveBeenCalledWith('arg1', 'arg2');
      expect(aroundSpy).toHaveBeenCalledWith('arg1', 'arg2');
      expect(afterReturningSpy).toHaveBeenCalledWith('arg1', 'arg2');
      expect(afterSpy).toHaveBeenCalledWith('arg1', 'arg2');
      expect(originalMethod).not.toHaveBeenCalled();
    });

    it('should handle undefined result in after-returning chain', () => {
      const afterReturningSpy = jest.fn();
      class MockAOPDecorator implements IAOPDecorator {
        before() {
          return jest.fn();
        }
        after() {
          return jest.fn();
        }
        afterReturning() {
          return afterReturningSpy;
        }
        afterThrowing() {
          return jest.fn();
        }
        around() {
          return jest.fn();
        }
      }

      const mockDecorator = new MockAOPDecorator();
      jest.spyOn(mockDecorator, 'afterReturning');
      const instance = {};
      const originalMethod = jest.fn().mockReturnValue(undefined);

      const decorators: AOPDecoratorMetadataWithOrder[] = [
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.AFTER_RETURNING,
          options: {},
          order: 0,
        },
      ];

      const aopDecorators = [mockDecorator];

      const chains = (service as any).createAllChains({
        decoratorsByType: { [AOP_TYPES.AFTER_RETURNING]: decorators },
        aopDecorators,
        originalMethod,
        methodName: 'testMethod',
      });

      const combinedMethod = (service as any).combineChains({
        chains,
        originalMethod,
        instance,
      });

      const result = combinedMethod('arg1', 'arg2');

      expect(result).toBeUndefined();
      expect(mockDecorator.afterReturning).toHaveBeenCalledWith({
        method: originalMethod,
        options: {},
        result: undefined,
      });
      expect(afterReturningSpy).toHaveBeenCalledWith('arg1', 'arg2');
      expect(originalMethod).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle null result in after-returning chain', () => {
      const afterReturningSpy = jest.fn();
      class MockAOPDecorator implements IAOPDecorator {
        before() {
          return jest.fn();
        }
        after() {
          return jest.fn();
        }
        afterReturning() {
          return afterReturningSpy;
        }
        afterThrowing() {
          return jest.fn();
        }
        around() {
          return jest.fn();
        }
      }

      const mockDecorator = new MockAOPDecorator();
      jest.spyOn(mockDecorator, 'afterReturning');
      const instance = {};
      const originalMethod = jest.fn().mockReturnValue(null);

      const decorators: AOPDecoratorMetadataWithOrder[] = [
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.AFTER_RETURNING,
          options: {},
          order: 0,
        },
      ];

      const aopDecorators = [mockDecorator];

      const chains = (service as any).createAllChains({
        decoratorsByType: { [AOP_TYPES.AFTER_RETURNING]: decorators },
        aopDecorators,
        originalMethod,
        methodName: 'testMethod',
      });

      const combinedMethod = (service as any).combineChains({
        chains,
        originalMethod,
        instance,
      });

      const result = combinedMethod('arg1', 'arg2');

      expect(result).toBeNull();
      expect(mockDecorator.afterReturning).toHaveBeenCalledWith({
        method: originalMethod,
        options: {},
        result: null,
      });
      expect(afterReturningSpy).toHaveBeenCalledWith('arg1', 'arg2');
      expect(originalMethod).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle mixed undefined chains', () => {
      const beforeSpy = jest.fn();
      const afterReturningSpy = jest.fn();
      class MockAOPDecorator implements IAOPDecorator {
        before() {
          return beforeSpy;
        }
        after() {
          return jest.fn();
        }
        afterReturning() {
          return afterReturningSpy;
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
      jest.spyOn(mockDecorator, 'afterReturning');
      const instance = {};
      const originalMethod = jest.fn().mockReturnValue('result');

      const decorators: AOPDecoratorMetadataWithOrder[] = [
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.BEFORE,
          options: {},
          order: 0,
        },
        {
          decoratorClass: MockAOPDecorator,
          type: AOP_TYPES.AFTER_RETURNING,
          options: {},
          order: 0,
        },
      ];

      const aopDecorators = [mockDecorator];

      const chains = (service as any).createAllChains({
        decoratorsByType: {
          [AOP_TYPES.BEFORE]: [decorators[0]],
          [AOP_TYPES.AFTER_RETURNING]: [decorators[1]],
          [AOP_TYPES.AFTER]: [],
          [AOP_TYPES.AROUND]: [],
          [AOP_TYPES.AFTER_THROWING]: [],
        },
        aopDecorators,
        originalMethod,
        methodName: 'testMethod',
      });

      const combinedMethod = (service as any).combineChains({
        chains,
        originalMethod,
        instance,
      });

      const result = combinedMethod('arg1', 'arg2');

      expect(result).toBe('result');
      expect(mockDecorator.before).toHaveBeenCalledWith({
        method: originalMethod,
        options: {},
      });
      expect(mockDecorator.afterReturning).toHaveBeenCalledWith({
        method: originalMethod,
        options: {},
        result: 'result',
      });
      expect(beforeSpy).toHaveBeenCalledWith('arg1', 'arg2');
      expect(afterReturningSpy).toHaveBeenCalledWith('arg1', 'arg2');
      expect(originalMethod).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle all chains undefined', () => {
      const instance = {};
      const originalMethod = jest.fn().mockReturnValue('result');

      const chains = {
        [AOP_TYPES.BEFORE]: undefined,
        [AOP_TYPES.AFTER]: undefined,
        [AOP_TYPES.AROUND]: undefined,
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
