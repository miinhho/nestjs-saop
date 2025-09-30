import { AOP_ORDER_METADATA_KEY } from '../decorators';
import { AOP_TYPES } from '../interfaces';
import { AOP_METADATA_KEY } from '../utils';
import { MethodProcessor } from './method-processor.service';

describe('MethodProcessor - Cache Functionality', () => {
  let service: MethodProcessor;

  beforeEach(() => {
    service = new MethodProcessor();
  });

  describe('WeakMap primary cache', () => {
    it('should cache results using WeakMap with class constructor as key', () => {
      class TestClass {
        method1() {}
      }
      class TestDecorator {}

      const wrapper = {
        instance: new TestClass(),
        metatype: TestClass,
      };

      jest.spyOn(Reflect, 'getMetadata').mockImplementation((key, target, propertyKey) => {
        if (key === AOP_METADATA_KEY && propertyKey === 'method1') {
          return [{ type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator }];
        }
        if (key === AOP_ORDER_METADATA_KEY && target === TestDecorator) {
          return 0;
        }
        return undefined;
      });

      // First call - should process and cache
      const result1 = service.processInstanceMethods(wrapper);
      const stats1 = service.getCacheStats();

      expect(stats1.misses).toBe(1);
      expect(stats1.hits).toBe(0);
      expect(result1.methods).toHaveLength(1);
      expect(result1.actualMetatype).toBe(TestClass);

      // Second call - should use cache
      const result2 = service.processInstanceMethods(wrapper);
      const stats2 = service.getCacheStats();

      expect(stats2.misses).toBe(1);
      expect(stats2.hits).toBe(1);
      expect(result2).toEqual(result1);
      expect(result2).toBe(result1);
    });
  });

  describe('Cache invalidation', () => {
    it('should clear all caches and reset statistics', () => {
      class TestClass {
        method1() {}
      }

      const wrapper = { instance: new TestClass(), metatype: TestClass };
      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      // Populate caches
      service.processInstanceMethods(wrapper);
      service.processInstanceMethods(wrapper);

      let stats = service.getCacheStats();
      expect(stats.misses).toBe(1);
      expect(stats.hits).toBe(1);

      service.clearCaches();

      stats = service.getCacheStats();
      expect(stats.misses).toBe(0);
      expect(stats.hits).toBe(0);

      // Next call should be a miss again
      service.processInstanceMethods(wrapper);
      stats = service.getCacheStats();
      expect(stats.misses).toBe(1);
    });

    it('should invalidate cache for specific class', () => {
      class TestClass1 {
        method1() {}
      }
      class TestClass2 {
        method1() {}
      }

      const wrapper1 = { instance: new TestClass1(), metatype: TestClass1 };
      const wrapper2 = { instance: new TestClass2(), metatype: TestClass2 };

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      // Populate both caches
      service.processInstanceMethods(wrapper1);
      service.processInstanceMethods(wrapper2);
      service.processInstanceMethods(wrapper1); // Hit cache
      service.processInstanceMethods(wrapper2); // Hit cache

      let stats = service.getCacheStats();
      expect(stats.hits).toBe(2);

      // Invalidate only TestClass1
      (service as any).classCache.delete(TestClass1);

      // TestClass1 should miss, TestClass2 should hit
      service.processInstanceMethods(wrapper1); // Miss
      service.processInstanceMethods(wrapper2); // Hit

      stats = service.getCacheStats();
      expect(stats.misses).toBe(3); // 2 initial + 1 after invalidation
      expect(stats.hits).toBe(3); // 2 before + 1 TestClass2 hit
    });
  });

  describe('Cache performance validation', () => {
    it('should demonstrate significant performance improvement with cache', () => {
      class TestClass {
        method1() {}
        method2() {}
        method3() {}
      }
      class TestDecorator {}

      const wrapper = { instance: new TestClass(), metatype: TestClass };

      // Mock complex metadata processing
      let processCallCount = 0;
      jest.spyOn(Reflect, 'getMetadata').mockImplementation(key => {
        if (key === AOP_METADATA_KEY) {
          processCallCount++;
          return [{ type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator }];
        }
        if (key === AOP_ORDER_METADATA_KEY) {
          return 1;
        }
        return undefined;
      });

      // First call - should process all methods
      service.processInstanceMethods(wrapper);

      const initialProcessCalls = processCallCount;
      expect(initialProcessCalls).toBeGreaterThan(0);

      // Reset call count to measure cache performance
      processCallCount = 0;

      // Subsequent calls - should use cache
      for (let i = 0; i < 100; i++) {
        service.processInstanceMethods(wrapper);
      }

      // Cache should prevent reprocessing
      expect(processCallCount).toBe(0);

      // Verify cache statistics
      const stats = service.getCacheStats();
      expect(stats.hits).toBe(100);
      expect(stats.misses).toBe(1);

      // Performance should be significantly better (though timing is environment-dependent)
      // We mainly check that no reprocessing occurred
      expect(processCallCount).toBe(0);
    });

    it('should handle high-frequency cache operations efficiently', () => {
      const classes = [];
      const wrappers = [];

      for (let i = 0; i < 50; i++) {
        const TestClass = class {
          method1() {}
        };
        Object.defineProperty(TestClass, 'name', { value: `TestClass${i}` });
        classes.push(TestClass);
        wrappers.push({ instance: new TestClass(), metatype: TestClass });
      }

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      wrappers.forEach(wrapper => service.processInstanceMethods(wrapper));

      const iterations = 1000;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        const randomWrapper = wrappers[i % wrappers.length];
        service.processInstanceMethods(randomWrapper);
      }

      const elapsed = Date.now() - start;
      const stats = service.getCacheStats();

      // Should be mostly cache hits
      expect(stats.hits).toBe(iterations);
      expect(stats.misses).toBe(50); // One per class

      // Performance should be reasonable (< 1ms per operation on average)
      const avgTime = elapsed / iterations;
      expect(avgTime).toBeLessThan(1);

      console.log(`Cache performance: ${avgTime.toFixed(3)}ms per operation`);
      console.log(`Cache stats:`, stats);
      console.log(`Cache hit rate: ${service.getCacheHitRate().toFixed(1)}%`);
    });
  });

  describe('Edge cases', () => {
    it('should handle invalid wrapper gracefully', () => {
      const result1 = service.processInstanceMethods(null);
      const result2 = service.processInstanceMethods(undefined);
      const result3 = service.processInstanceMethods({});
      const result4 = service.processInstanceMethods({ instance: null });
      const result5 = service.processInstanceMethods({ metatype: null });

      expect(result1).toEqual({ methods: [], actualMetatype: null });
      expect(result2).toEqual({ methods: [], actualMetatype: null });
      expect(result3).toEqual({ methods: [], actualMetatype: null });
      expect(result4).toEqual({ methods: [], actualMetatype: null });
      expect(result5).toEqual({ methods: [], actualMetatype: null });

      // Should not affect cache statistics for invalid inputs
      const stats = service.getCacheStats();
      expect(stats.misses).toBe(0);
      expect(stats.hits).toBe(0);
    });

    it('should handle classes with prototype pollution attempts', () => {
      class TestClass {
        method1() {}
      }

      (TestClass.prototype as any).__proto__ = { maliciousMethod: () => {} };

      const wrapper = { instance: new TestClass(), metatype: TestClass };
      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      // Should not include polluted methods and not crash
      const result = service.processInstanceMethods(wrapper);
      expect(result.methods).toEqual([]);
      expect(result.actualMetatype).toBe(TestClass);

      // Should still cache safely
      const result2 = service.processInstanceMethods(wrapper);
      expect(result2).toEqual(result);

      const stats = service.getCacheStats();
      expect(stats.hits).toBe(1);
    });

    it('should handle concurrent access safely', async () => {
      class TestClass {
        method1() {}
      }

      const wrapper = { instance: new TestClass(), metatype: TestClass };
      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      // Simulate concurrent access
      const promises = Array.from({ length: 100 }, () =>
        Promise.resolve(service.processInstanceMethods(wrapper)),
      );

      const results = await Promise.all(promises);

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result).toBe(firstResult); // Same reference from cache
      });

      const stats = service.getCacheStats();
      expect(stats.misses).toBe(1);
      expect(stats.hits).toBe(99);
    });
  });

  describe('Test isolation', () => {
    it('should not share cache between different service instances', () => {
      class TestClass {
        method1() {}
      }

      const service1 = new MethodProcessor();
      const service2 = new MethodProcessor();
      const wrapper = { instance: new TestClass(), metatype: TestClass };

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      // Both services process the same class
      service1.processInstanceMethods(wrapper);
      service2.processInstanceMethods(wrapper);

      const stats1 = service1.getCacheStats();
      const stats2 = service2.getCacheStats();

      // Each service should have its own cache miss
      expect(stats1.misses).toBe(1);
      expect(stats1.hits).toBe(0);
      expect(stats2.misses).toBe(1);
      expect(stats2.hits).toBe(0);
    });

    it('should maintain cache consistency within same service instance', () => {
      class TestClass {
        method1() {}
      }

      const wrapper = { instance: new TestClass(), metatype: TestClass };
      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      // First call - cache miss
      const result1 = service.processInstanceMethods(wrapper);
      const stats1 = service.getCacheStats();

      // Second call - cache hit
      const result2 = service.processInstanceMethods(wrapper);
      const stats2 = service.getCacheStats();

      // Results should be identical (same reference from cache)
      expect(result1).toBe(result2);
      expect(stats1.misses).toBe(1);
      expect(stats1.hits).toBe(0);
      expect(stats2.misses).toBe(1);
      expect(stats2.hits).toBe(1);
    });
  });

  describe('Cache statistics and monitoring', () => {
    it('should provide accurate cache hit rate calculation', () => {
      class TestClass {
        method1() {}
      }

      const wrapper = { instance: new TestClass(), metatype: TestClass };
      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      // Initial state - no operations
      expect(service.getCacheHitRate()).toBe(0);

      // After first call (miss)
      service.processInstanceMethods(wrapper);
      expect(service.getCacheHitRate()).toBe(0);

      // After second call (hit)
      service.processInstanceMethods(wrapper);
      expect(service.getCacheHitRate()).toBe(50);

      // After third call (hit)
      service.processInstanceMethods(wrapper);
      expect(service.getCacheHitRate()).toBeCloseTo(66.67, 1);
    });

    it('should track cache statistics correctly across multiple classes', () => {
      class TestClass1 {
        method1() {}
      }
      class TestClass2 {
        method1() {}
      }
      class TestClass3 {
        method1() {}
      }

      const wrappers = [
        { instance: new TestClass1(), metatype: TestClass1 },
        { instance: new TestClass2(), metatype: TestClass2 },
        { instance: new TestClass3(), metatype: TestClass3 },
      ];

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      // First round - all misses
      wrappers.forEach(wrapper => service.processInstanceMethods(wrapper));
      let stats = service.getCacheStats();
      expect(stats.misses).toBe(3);
      expect(stats.hits).toBe(0);

      // Second round - all hits
      wrappers.forEach(wrapper => service.processInstanceMethods(wrapper));
      stats = service.getCacheStats();
      expect(stats.misses).toBe(3);
      expect(stats.hits).toBe(3);

      expect(service.getCacheHitRate()).toBe(50);
    });
  });
});
