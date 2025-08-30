import { Test, TestingModule } from '@nestjs/testing';
import { SAOPModule } from '../src/saop.module';

describe('MethodProcessorService', () => {
  let module: TestingModule;
  let methodProcessor: any;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [SAOPModule.forRoot()],
    }).compile();

    const saopModule = module.get(SAOPModule);
    methodProcessor = (saopModule as any).methodProcessor;
  });

  it('should have MethodProcessor service', () => {
    expect(methodProcessor).toBeDefined();
    expect(typeof methodProcessor.processInstanceMethods).toBe('function');
  });

  it('should return empty array when wrapper has no instance', () => {
    const result = methodProcessor.processInstanceMethods({ metatype: class Test {} });
    expect(result).toEqual([]);
  });

  it('should return empty array when wrapper has no metatype', () => {
    const result = methodProcessor.processInstanceMethods({ instance: {} });
    expect(result).toEqual([]);
  });

  it('should return empty array when metatype has no valid prototype', () => {
    const mockMetatype = { prototype: null };
    const result = methodProcessor.processInstanceMethods({ instance: {}, metatype: mockMetatype });
    expect(result).toEqual([]);
  });

  it('should handle prototype access error', () => {
    const mockMetatype = {
      get prototype() {
        throw new Error('Access denied');
      },
    };
    const result = methodProcessor.processInstanceMethods({ instance: {}, metatype: mockMetatype });
    expect(result).toEqual([]);
  });

  it('should handle invalid prototype type', () => {
    const mockMetatype = { prototype: 'not an object' };
    const result = methodProcessor.processInstanceMethods({ instance: {}, metatype: mockMetatype });
    expect(result).toEqual([]);
  });

  it('should handle getOwnPropertyNames error', () => {
    const mockPrototype = {
      constructor: function () {},
    };

    Object.defineProperty(mockPrototype, 'constructor', {
      get() {
        throw new Error('Property access error');
      },
    });

    const result = methodProcessor.processInstanceMethods({
      instance: {},
      metatype: { prototype: mockPrototype },
    });
    expect(result).toEqual([]);
  });

  it('should handle method property access error during filtering', () => {
    const mockPrototype = {
      constructor: function () {},
      testMethod: function () {},
    };

    Object.defineProperty(mockPrototype, 'testMethod', {
      get() {
        throw new Error('Property access error');
      },
    });

    const result = methodProcessor.processInstanceMethods({
      instance: {},
      metatype: { prototype: mockPrototype },
    });
    expect(result).toHaveLength(0);
  });

  it('should handle non-function properties in prototype', () => {
    const mockPrototype = {
      constructor: function () {},
      regularProperty: 'not a function',
      anotherProperty: 123,
    };

    const result = methodProcessor.processInstanceMethods({
      instance: {},
      metatype: { prototype: mockPrototype },
    });
    expect(result).toHaveLength(0);
  });

  it('should filter out constructor and non-function properties', () => {
    const mockPrototype = {
      constructor: function () {},
      regularMethod: function () {
        return 'test';
      },
      anotherMethod: function () {
        return 'another';
      },
      property: 'not function',
    };

    // Mock Reflect.getMetadata to return decorators for methods
    const originalGetMetadata = Reflect.getMetadata;
    (Reflect as any).getMetadata = jest.fn(
      (key: any, target: any, propertyKey: string | symbol) => {
        if (propertyKey === 'regularMethod' || propertyKey === 'anotherMethod') {
          return [{ type: 'before', options: {} }];
        }
        return undefined;
      },
    );

    const result = methodProcessor.processInstanceMethods({
      instance: {},
      metatype: { prototype: mockPrototype },
    });
    expect(result).toHaveLength(2);
    expect(result.map((r: any) => r.methodName)).toEqual(['regularMethod', 'anotherMethod']);

    Reflect.getMetadata = originalGetMetadata;
  });

  it('should handle Reflect.getMetadata returning undefined', () => {
    const mockPrototype = {
      constructor: function () {},
      testMethod: function () {},
    };

    // Mock Reflect.getMetadata to return undefined
    const originalGetMetadata = Reflect.getMetadata;
    Reflect.getMetadata = jest.fn().mockReturnValue(undefined);

    const result = methodProcessor.processInstanceMethods({
      instance: {},
      metatype: { prototype: mockPrototype },
    });
    expect(result).toHaveLength(0);

    Reflect.getMetadata = originalGetMetadata;
  });

  it('should handle Reflect.getMetadata returning empty array', () => {
    const mockPrototype = {
      constructor: function () {},
      testMethod: function () {},
    };

    // Mock Reflect.getMetadata to return empty array
    const originalGetMetadata = Reflect.getMetadata;
    Reflect.getMetadata = jest.fn().mockReturnValue([]);

    const result = methodProcessor.processInstanceMethods({
      instance: {},
      metatype: { prototype: mockPrototype },
    });
    expect(result).toHaveLength(0);

    Reflect.getMetadata = originalGetMetadata;
  });

  it('should handle getPrototype returning null', () => {
    const mockMetatype = {
      prototype: null,
    };

    const result = methodProcessor.processInstanceMethods({
      instance: {},
      metatype: mockMetatype,
    });
    expect(result).toHaveLength(0);
  });

  it('should handle getPrototype returning undefined', () => {
    const mockMetatype = {
      prototype: undefined,
    };

    const result = methodProcessor.processInstanceMethods({
      instance: {},
      metatype: mockMetatype,
    });
    expect(result).toHaveLength(0);
  });

  it('should handle getPrototype throwing error', () => {
    const mockMetatype = {};
    Object.defineProperty(mockMetatype, 'prototype', {
      get: () => {
        throw new Error('Prototype access error');
      },
    });

    const result = methodProcessor.processInstanceMethods({
      instance: {},
      metatype: mockMetatype,
    });
    expect(result).toHaveLength(0);
  });

  it('should handle getMethodNames with null prototype', () => {
    const result = (methodProcessor as any).getMethodNames(null);
    expect(result).toEqual([]);
  });

  it('should handle getMethodNames with undefined prototype', () => {
    const result = (methodProcessor as any).getMethodNames(undefined);
    expect(result).toEqual([]);
  });

  it('should handle getMethodNames with non-object prototype', () => {
    const result = (methodProcessor as any).getMethodNames('not an object');
    expect(result).toEqual([]);
  });

  it('should handle getMethodNames with prototype that has no properties', () => {
    const mockPrototype = {};
    const result = (methodProcessor as any).getMethodNames(mockPrototype);
    expect(result).toEqual([]);
  });

  it('should handle getMethodNames when Object.getOwnPropertyNames throws error', () => {
    const mockPrototype = {
      constructor: function () {},
    };

    // Mock Object.getOwnPropertyNames to throw error
    const originalGetOwnPropertyNames = Object.getOwnPropertyNames;
    Object.getOwnPropertyNames = jest.fn().mockImplementation(() => {
      throw new Error('getOwnPropertyNames error');
    });

    const result = (methodProcessor as any).getMethodNames(mockPrototype);
    expect(result).toEqual([]);

    // Restore original function
    Object.getOwnPropertyNames = originalGetOwnPropertyNames;
  });
});
