import { DiscoveryModule } from '@nestjs/core';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AOPModule } from './aop.module';
import { AOP_TYPES } from './interfaces';
import { DecoratorApplier } from './services/decorator-applier.service';
import { InstanceCollector } from './services/instance-collector.service';
import { MethodProcessor } from './services/method-processor.service';

describe('AOPModule', () => {
  let module: TestingModule;
  let aopModule: AOPModule;
  let instanceCollector: jest.Mocked<InstanceCollector>;
  let methodProcessor: jest.Mocked<MethodProcessor>;
  let decoratorApplier: jest.Mocked<DecoratorApplier>;

  beforeEach(async () => {
    const mockInstanceCollector = {
      collectAllInstances: jest.fn().mockReturnValue([]),
      collectAOPDecorators: jest.fn().mockReturnValue([]),
    };
    const mockMethodProcessor = {
      processInstanceMethods: jest.fn().mockReturnValue([]),
    };
    const mockDecoratorApplier = {
      applyDecorators: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [AOPModule.forRoot()],
    })
      .overrideProvider(InstanceCollector)
      .useValue(mockInstanceCollector)
      .overrideProvider(MethodProcessor)
      .useValue(mockMethodProcessor)
      .overrideProvider(DecoratorApplier)
      .useValue(mockDecoratorApplier)
      .compile();

    aopModule = module.get<AOPModule>(AOPModule);
    instanceCollector = module.get(InstanceCollector);
    methodProcessor = module.get(MethodProcessor);
    decoratorApplier = module.get(DecoratorApplier);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('forRoot', () => {
    it('should return a dynamic module with correct configuration', () => {
      const dynamicModule = AOPModule.forRoot();

      expect(dynamicModule).toEqual({
        module: AOPModule,
        imports: [DiscoveryModule],
        global: true,
      });
    });
  });

  describe('onModuleInit', () => {
    it('should call initializeAOP on module init', () => {
      const initializeAOPSpy = jest.spyOn(aopModule as any, 'initializeAOP');

      aopModule.onModuleInit();

      expect(initializeAOPSpy).toHaveBeenCalled();
    });
  });

  describe('initializeAOP', () => {
    it('should collect all instances and process them', () => {
      const mockWrapper1 = { instance: {}, metatype: class Test {} } as any;
      const mockWrapper2 = { instance: {}, metatype: class Test2 {} } as any;
      const mockInstances = [mockWrapper1, mockWrapper2];

      instanceCollector.collectAllInstances.mockReturnValue(mockInstances);
      methodProcessor.processInstanceMethods.mockReturnValue([]);
      instanceCollector.collectAOPDecorators.mockReturnValue([]);

      (aopModule as any).initializeAOP();

      expect(instanceCollector.collectAllInstances).toHaveBeenCalled();
      expect(methodProcessor.processInstanceMethods).toHaveBeenCalledWith(mockWrapper1);
      expect(methodProcessor.processInstanceMethods).toHaveBeenCalledWith(mockWrapper2);
    });

    it('should handle null instances array', () => {
      instanceCollector.collectAllInstances.mockReturnValue(null as any);

      expect(() => (aopModule as any).initializeAOP()).toThrow();
    });
  });

  describe('processInstance', () => {
    it('should process instance methods and apply decorators', () => {
      const mockWrapper = { instance: {}, metatype: class Test {} } as any;
      const mockMethods = [
        {
          methodName: 'testMethod',
          decorators: [{ type: AOP_TYPES.BEFORE, options: {}, decoratorClass: 'TestDecorator' }],
        },
      ];
      const mockAOPDecorators = [{ name: 'TestDecorator' }] as any;

      methodProcessor.processInstanceMethods.mockReturnValue(mockMethods);
      instanceCollector.collectAOPDecorators.mockReturnValue(mockAOPDecorators);

      (aopModule as any).processInstance(mockWrapper);

      expect(methodProcessor.processInstanceMethods).toHaveBeenCalledWith(mockWrapper);
      expect(instanceCollector.collectAOPDecorators).toHaveBeenCalled();
      expect(decoratorApplier.applyDecorators).toHaveBeenCalledWith({
        instance: mockWrapper.instance,
        methodName: 'testMethod',
        decorators: mockMethods[0]!.decorators,
        aopDecorators: mockAOPDecorators,
        originalMethod: (mockWrapper.metatype.prototype as any).testMethod,
      });
    });

    it('should return early if no methods found', () => {
      const mockWrapper = { instance: {}, metatype: class Test {} };

      methodProcessor.processInstanceMethods.mockReturnValue([]);

      (aopModule as any).processInstance(mockWrapper);

      expect(methodProcessor.processInstanceMethods).toHaveBeenCalledWith(mockWrapper);
      expect(instanceCollector.collectAOPDecorators).not.toHaveBeenCalled();
      expect(decoratorApplier.applyDecorators).not.toHaveBeenCalled();
    });

    it('should handle multiple methods', () => {
      const mockWrapper = { instance: {}, metatype: class Test {} };
      const mockMethods = [
        {
          methodName: 'method1',
          decorators: [{ type: AOP_TYPES.BEFORE, options: {}, decoratorClass: 'TestDecorator' }],
        },
        {
          methodName: 'method2',
          decorators: [{ type: AOP_TYPES.AFTER, options: {}, decoratorClass: 'TestDecorator2' }],
        },
      ];
      const mockAOPDecorators = [{ name: 'TestDecorator' }, { name: 'TestDecorator2' }] as any;

      methodProcessor.processInstanceMethods.mockReturnValue(mockMethods);
      instanceCollector.collectAOPDecorators.mockReturnValue(mockAOPDecorators);

      (aopModule as any).processInstance(mockWrapper);

      expect(decoratorApplier.applyDecorators).toHaveBeenCalledTimes(2);
    });

    it('should handle null wrapper', () => {
      methodProcessor.processInstanceMethods.mockImplementation(() => {
        throw new Error('Null wrapper');
      });

      expect(() => (aopModule as any).processInstance(null)).toThrow('Null wrapper');
    });

    it('should handle wrapper without metatype', () => {
      const mockWrapper = { instance: {} };

      methodProcessor.processInstanceMethods.mockReturnValue([]);

      (aopModule as any).processInstance(mockWrapper);

      expect(methodProcessor.processInstanceMethods).toHaveBeenCalledWith(mockWrapper);
    });
  });

  describe('processMethod', () => {
    it('should apply decorators to the method', () => {
      const mockWrapper = { instance: {}, metatype: class Test {} } as any;
      const mockDecorators = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: 'TestDecorator' },
      ];
      const mockAOPDecorators = [{ name: 'TestDecorator' }] as any;
      const originalMethod = jest.fn();

      (mockWrapper.metatype.prototype as any).testMethod = originalMethod;

      (aopModule as any).processMethod({
        wrapper: mockWrapper,
        methodName: 'testMethod',
        decorators: mockDecorators,
        aopDecorators: mockAOPDecorators,
      });

      expect(decoratorApplier.applyDecorators).toHaveBeenCalledWith({
        instance: mockWrapper.instance,
        methodName: 'testMethod',
        decorators: mockDecorators,
        aopDecorators: mockAOPDecorators,
        originalMethod,
      });
    });

    it('should handle method that does not exist on prototype', () => {
      const mockWrapper = { instance: {}, metatype: class Test {} };
      const mockDecorators = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: 'TestDecorator' },
      ];
      const mockAOPDecorators = [{ name: 'TestDecorator' }];

      (aopModule as any).processMethod({
        wrapper: mockWrapper,
        methodName: 'nonExistentMethod',
        decorators: mockDecorators,
        aopDecorators: mockAOPDecorators,
      });

      expect(decoratorApplier.applyDecorators).toHaveBeenCalledWith({
        instance: mockWrapper.instance,
        methodName: 'nonExistentMethod',
        decorators: mockDecorators,
        aopDecorators: mockAOPDecorators,
        originalMethod: undefined,
      });
    });

    it('should handle empty decorators array', () => {
      const mockWrapper = { instance: {}, metatype: class Test {} };
      const mockAOPDecorators = [{ name: 'TestDecorator' }];
      const originalMethod = jest.fn();

      (mockWrapper.metatype.prototype as any).testMethod = originalMethod;

      (aopModule as any).processMethod({
        wrapper: mockWrapper,
        methodName: 'testMethod',
        decorators: [],
        aopDecorators: mockAOPDecorators,
      });

      expect(decoratorApplier.applyDecorators).toHaveBeenCalledWith({
        instance: mockWrapper.instance,
        methodName: 'testMethod',
        decorators: [],
        aopDecorators: mockAOPDecorators,
        originalMethod,
      });
    });

    it('should handle null aopDecorators', () => {
      const mockWrapper = { instance: {}, metatype: class Test {} };
      const mockDecorators = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: 'TestDecorator' },
      ];
      const originalMethod = jest.fn();

      (mockWrapper.metatype.prototype as any).testMethod = originalMethod;

      (aopModule as any).processMethod({
        wrapper: mockWrapper,
        methodName: 'testMethod',
        decorators: mockDecorators,
        aopDecorators: null as any,
      });

      expect(decoratorApplier.applyDecorators).toHaveBeenCalledWith({
        instance: mockWrapper.instance,
        methodName: 'testMethod',
        decorators: mockDecorators,
        aopDecorators: null,
        originalMethod,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle symbol method names', () => {
      const symbolMethod = Symbol('testMethod');
      const mockWrapper = { instance: {}, metatype: class Test {} };
      const mockDecorators = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: 'TestDecorator' },
      ];
      const mockAOPDecorators = [{ name: 'TestDecorator' }];
      const originalMethod = jest.fn();

      (mockWrapper.metatype.prototype as any)[symbolMethod] = originalMethod;

      (aopModule as any).processMethod({
        wrapper: mockWrapper,
        methodName: symbolMethod,
        decorators: mockDecorators,
        aopDecorators: mockAOPDecorators,
      });

      expect(decoratorApplier.applyDecorators).toHaveBeenCalledWith({
        instance: mockWrapper.instance,
        methodName: symbolMethod,
        decorators: mockDecorators,
        aopDecorators: mockAOPDecorators,
        originalMethod,
      });
    });

    it('should handle instance without prototype methods', () => {
      const mockWrapper = { instance: {}, metatype: undefined };
      const mockDecorators = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: 'TestDecorator' },
      ];
      const mockAOPDecorators = [{ name: 'TestDecorator' }];

      (aopModule as any).processMethod({
        wrapper: mockWrapper,
        methodName: 'testMethod',
        decorators: mockDecorators,
        aopDecorators: mockAOPDecorators,
      });

      expect(decoratorApplier.applyDecorators).toHaveBeenCalledWith({
        instance: mockWrapper.instance,
        methodName: 'testMethod',
        decorators: mockDecorators,
        aopDecorators: mockAOPDecorators,
        originalMethod: undefined,
      });
    });

    it('should handle large number of instances', () => {
      const mockInstances = Array.from({ length: 100 }, (_, i) => ({
        instance: { id: i },
        metatype: class Test {},
      })) as any;

      instanceCollector.collectAllInstances.mockReturnValue(mockInstances);
      methodProcessor.processInstanceMethods.mockReturnValue([]);
      instanceCollector.collectAOPDecorators.mockReturnValue([]);

      (aopModule as any).initializeAOP();

      expect(methodProcessor.processInstanceMethods).toHaveBeenCalledTimes(100);
    });
  });
});
