import { AOP_ORDER_METADATA_KEY } from '../decorators';
import { AOP_TYPES } from '../interfaces';
import { AOP_METADATA_KEY } from '../utils';
import { MethodProcessor } from './method-processor.service';

describe('MethodProcessor - Cache Functionality', () => {
  let service: MethodProcessor;

  beforeEach(() => {
    service = new MethodProcessor();
  });

  /**
   * Spies on Reflect.getMetadata and counts how many times method-level AOP
   * metadata is read, which only happens while a class is (re)processed. A
   * cache hit performs no such reads, so the counter reveals reprocessing.
   */
  const trackProcessing = (decoratorClass: Function = class {}) => {
    const counter = { reads: 0 };
    jest.spyOn(Reflect, 'getMetadata').mockImplementation((key, _target, propertyKey) => {
      if (key === AOP_METADATA_KEY) {
        if (propertyKey !== undefined) counter.reads++;
        return propertyKey === 'method1'
          ? [{ type: AOP_TYPES.BEFORE, options: {}, decoratorClass }]
          : undefined;
      }
      if (key === AOP_ORDER_METADATA_KEY) return 0;
      return undefined;
    });
    return counter;
  };

  describe('WeakMap primary cache', () => {
    it('should return the cached result by reference on repeated calls', () => {
      class TestClass {
        method1() {}
      }
      const counter = trackProcessing();
      const wrapper = { instance: new TestClass(), metatype: TestClass } as any;

      const first = service.processInstanceMethods(wrapper);
      const readsAfterFirst = counter.reads;

      const second = service.processInstanceMethods(wrapper);

      expect(first.methods).toHaveLength(1);
      expect(first.metatype).toBe(TestClass);
      // Same object reference from the cache, and no reprocessing happened.
      expect(second).toBe(first);
      expect(counter.reads).toBe(readsAfterFirst);
    });

    it('should not reprocess across many repeated calls', () => {
      class TestClass {
        method1() {}
        method2() {}
        method3() {}
      }
      const counter = trackProcessing();
      const wrapper = { instance: new TestClass(), metatype: TestClass } as any;

      service.processInstanceMethods(wrapper);
      const readsAfterFirst = counter.reads;
      expect(readsAfterFirst).toBeGreaterThan(0);

      for (let i = 0; i < 100; i++) {
        service.processInstanceMethods(wrapper);
      }

      expect(counter.reads).toBe(readsAfterFirst);
    });
  });

  describe('Per-class caching', () => {
    it('should cache each class independently', () => {
      class TestClass1 {
        method1() {}
      }
      class TestClass2 {
        method1() {}
      }
      trackProcessing();

      const wrapper1 = { instance: new TestClass1(), metatype: TestClass1 } as any;
      const wrapper2 = { instance: new TestClass2(), metatype: TestClass2 } as any;

      const a1 = service.processInstanceMethods(wrapper1);
      const b1 = service.processInstanceMethods(wrapper2);

      expect(service.processInstanceMethods(wrapper1)).toBe(a1);
      expect(service.processInstanceMethods(wrapper2)).toBe(b1);
      expect(a1).not.toBe(b1);
    });

    it('should reprocess a class after its cache entry is removed', () => {
      class TestClass {
        method1() {}
      }
      const counter = trackProcessing();
      const wrapper = { instance: new TestClass(), metatype: TestClass } as any;

      service.processInstanceMethods(wrapper);
      const readsAfterFirst = counter.reads;

      (service as any).classCache.delete(TestClass);

      service.processInstanceMethods(wrapper);
      expect(counter.reads).toBeGreaterThan(readsAfterFirst);
    });
  });

  describe('Cache isolation', () => {
    it('should not share cache between different service instances', () => {
      class TestClass {
        method1() {}
      }
      trackProcessing();
      const wrapper = { instance: new TestClass(), metatype: TestClass } as any;

      const fromService1 = new MethodProcessor().processInstanceMethods(wrapper);
      const fromService2 = new MethodProcessor().processInstanceMethods(wrapper);

      // Structurally equal, but each service produced its own cached object.
      expect(fromService2).toEqual(fromService1);
      expect(fromService2).not.toBe(fromService1);
    });
  });

  describe('Edge cases', () => {
    it('should handle invalid wrappers gracefully without caching', () => {
      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      expect(service.processInstanceMethods(null as any)).toEqual({ methods: [], metatype: null });
      expect(service.processInstanceMethods(undefined as any)).toEqual({
        methods: [],
        metatype: null,
      });
      expect(service.processInstanceMethods({} as any)).toEqual({ methods: [], metatype: null });
      expect(service.processInstanceMethods({ instance: null } as any)).toEqual({
        methods: [],
        metatype: null,
      });
      expect(service.processInstanceMethods({ metatype: null } as any)).toEqual({
        methods: [],
        metatype: null,
      });
    });

    it('should handle classes with prototype pollution attempts', () => {
      class TestClass {
        method1() {}
      }
      (TestClass.prototype as any).__proto__ = { maliciousMethod: () => {} };

      const wrapper = { instance: new TestClass(), metatype: TestClass } as any;
      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      const result = service.processInstanceMethods(wrapper);
      expect(result.methods).toEqual([]);
      expect(result.metatype).toBe(TestClass);

      // Still cached safely.
      expect(service.processInstanceMethods(wrapper)).toBe(result);
    });

    it('should return the same cached reference under concurrent access', async () => {
      class TestClass {
        method1() {}
      }
      const wrapper = { instance: new TestClass(), metatype: TestClass } as any;
      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      const results = await Promise.all(
        Array.from({ length: 100 }, () => Promise.resolve(service.processInstanceMethods(wrapper))),
      );

      const first = results[0];
      results.forEach(result => expect(result).toBe(first));
    });
  });
});
