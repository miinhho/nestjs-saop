import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AOPModule } from './aop.module';
import { AOP_TYPES, AOPDecoratorMetadataWithOrder, AOPMethodWithDecorators } from './interfaces';
import { DecoratorApplier } from './services/decorator-applier.service';
import { InstanceCollector } from './services/instance-collector.service';
import { MethodProcessor } from './services/method-processor.service';

// Mock the resolveMetatype utility
jest.mock('./utils/resolve-metatype', () => ({
  resolveMetatype: jest.fn(wrapper => wrapper.metatype),
}));

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

  describe('forRoot', () => {
    it('should return a dynamic module with correct configuration', () => {
      const dynamicModule = AOPModule.forRoot();

      expect(dynamicModule).toEqual({
        module: AOPModule,
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
      methodProcessor.processInstanceMethods.mockReturnValue({ methods: [], metatype: null });
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
      class TestDecorator {
        testMethod() {}
      }
      const mockWrapper = { instance: {}, metatype: TestDecorator } as any;
      const mockMethods: AOPMethodWithDecorators[] = [
        {
          methodName: 'testMethod',
          decorators: [
            { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator, order: 0 },
          ],
        },
      ];
      const mockAOPDecorators = [{ name: TestDecorator.name }] as any;

      methodProcessor.processInstanceMethods.mockReturnValue({
        methods: mockMethods,
        metatype: TestDecorator,
      });
      instanceCollector.collectAOPDecorators.mockReturnValue(mockAOPDecorators);

      (aopModule as any).processInstance(mockWrapper, mockAOPDecorators);

      expect(methodProcessor.processInstanceMethods).toHaveBeenCalledWith(mockWrapper);
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

      methodProcessor.processInstanceMethods.mockReturnValue({ methods: [], metatype: null });

      (aopModule as any).processInstance(mockWrapper, []);

      expect(methodProcessor.processInstanceMethods).toHaveBeenCalledWith(mockWrapper);
      expect(decoratorApplier.applyDecorators).not.toHaveBeenCalled();
    });

    it('should handle multiple methods', () => {
      class TestDecorator {
        method1() {}
      }
      class TestDecorator2 {
        method2() {}
      }
      const mockWrapper = { instance: {}, metatype: class Test {} };
      const mockMethods: AOPMethodWithDecorators[] = [
        {
          methodName: 'method1',
          decorators: [
            { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator, order: 1 },
          ],
        },
        {
          methodName: 'method2',
          decorators: [
            { type: AOP_TYPES.AFTER, options: {}, decoratorClass: TestDecorator2, order: 2 },
          ],
        },
      ];
      const mockAOPDecorators = [
        { name: TestDecorator.name },
        { name: TestDecorator2.name },
      ] as any;

      methodProcessor.processInstanceMethods.mockReturnValue({
        methods: mockMethods,
        metatype: TestDecorator,
      });
      instanceCollector.collectAOPDecorators.mockReturnValue(mockAOPDecorators);

      (aopModule as any).processInstance(mockWrapper, mockAOPDecorators);

      expect(decoratorApplier.applyDecorators).toHaveBeenCalledTimes(2);
    });

    it('should handle null wrapper', () => {
      expect(() => (aopModule as any).processInstance(null, [])).not.toThrow();
    });

    it('should handle wrapper without metatype', () => {
      const mockWrapper = { instance: {} };

      methodProcessor.processInstanceMethods.mockReturnValue({ methods: [], metatype: null });

      (aopModule as any).processInstance(mockWrapper, []);

      expect(methodProcessor.processInstanceMethods).toHaveBeenCalledWith(mockWrapper);
    });
  });

  describe('processMethod', () => {
    it('should apply decorators to the method', () => {
      class TestDecorator {
        testMethod() {}
      }
      const mockWrapper = { instance: {}, metatype: TestDecorator } as any;
      const mockDecorators: AOPDecoratorMetadataWithOrder[] = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator, order: 0 },
      ];
      const mockAOPDecorators = [{ name: TestDecorator.name }];
      const originalMethod = jest.fn();

      (mockWrapper.metatype.prototype as any).testMethod = originalMethod;

      (aopModule as any).processMethod({
        wrapper: mockWrapper,
        methodName: 'testMethod',
        decorators: mockDecorators,
        aopDecorators: mockAOPDecorators,
        originalMethod,
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
      class TestDecorator {}
      const mockWrapper = { instance: {}, metatype: class Test {} };
      const mockDecorators: AOPDecoratorMetadataWithOrder[] = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator, order: 0 },
      ];
      const mockAOPDecorators = [{ name: TestDecorator.name }];

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
      class TestDecorator {
        testMethod() {}
      }
      const mockWrapper = { instance: {}, metatype: TestDecorator };
      const mockAOPDecorators = [{ name: TestDecorator.name }];
      const originalMethod = jest.fn();

      (mockWrapper.metatype.prototype as any).testMethod = originalMethod;

      (aopModule as any).processMethod({
        wrapper: mockWrapper,
        methodName: 'testMethod',
        decorators: [],
        aopDecorators: mockAOPDecorators,
        originalMethod,
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
      class TestDecorator {
        testMethod() {}
      }
      const mockWrapper = { instance: {}, metatype: TestDecorator };
      const mockDecorators: AOPDecoratorMetadataWithOrder[] = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator, order: 0 },
      ];
      const originalMethod = jest.fn();

      (mockWrapper.metatype.prototype as any).testMethod = originalMethod;

      (aopModule as any).processMethod({
        wrapper: mockWrapper,
        methodName: 'testMethod',
        decorators: mockDecorators,
        aopDecorators: null as any,
        originalMethod,
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
      class TestDecorator {
        [symbolMethod]() {}
      }
      const mockWrapper = { instance: {}, metatype: TestDecorator };
      const mockDecorators: AOPDecoratorMetadataWithOrder[] = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator, order: 0 },
      ];
      const mockAOPDecorators = [{ name: TestDecorator.name }];
      const originalMethod = jest.fn();

      (mockWrapper.metatype.prototype as any)[symbolMethod] = originalMethod;

      (aopModule as any).processMethod({
        wrapper: mockWrapper,
        methodName: symbolMethod,
        decorators: mockDecorators,
        aopDecorators: mockAOPDecorators,
        originalMethod,
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
      class TestDecorator {}
      const mockWrapper = { instance: {}, metatype: undefined };
      const mockDecorators: AOPDecoratorMetadataWithOrder[] = [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestDecorator, order: 0 },
      ];
      const mockAOPDecorators = [{ name: TestDecorator.name }];

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
      methodProcessor.processInstanceMethods.mockReturnValue({ methods: [], metatype: null });
      instanceCollector.collectAOPDecorators.mockReturnValue([]);

      (aopModule as any).initializeAOP();

      expect(methodProcessor.processInstanceMethods).toHaveBeenCalledTimes(100);
    });
  });
});
