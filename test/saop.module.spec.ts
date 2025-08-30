import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as SAOPIndex from '../src';
import * as SAOPInterfaces from '../src/interfaces';
import { SAOPModule } from '../src/saop.module';
import { LoggingDecorator } from './app/logging.decorator';
import { TestService } from './app/test.service';

describe('SAOPModule', () => {
  let module: TestingModule;
  let discoveryService: DiscoveryService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [SAOPModule.forRoot()],
      providers: [LoggingDecorator, TestService],
    }).compile();

    discoveryService = module.get(DiscoveryService);
  });

  describe('Library exports', () => {
    it('should export SAOPDecorator base class', () => {
      expect(SAOPIndex.SAOPDecorator).toBeDefined();
    });

    it('should export interfaces', () => {
      // Type-only exports cannot be tested at runtime
      // This test verifies the import works without errors
      expect(SAOPInterfaces).toBeDefined();
    });

    it('should export main module from index', () => {
      expect(SAOPIndex.SAOPModule).toBeDefined();
    });

    it('should not export function decorators from index', () => {
      // Function decorators (Around, Before, etc.) are no longer exported
      // Only SAOPDecorator base class is exported
      const exportedKeys = Object.keys(SAOPIndex);
      expect(exportedKeys).toContain('SAOPDecorator');
      expect(exportedKeys).toContain('SAOPModule');
      expect(exportedKeys).not.toContain('Around');
      expect(exportedKeys).not.toContain('Before');
      expect(exportedKeys).not.toContain('After');
      expect(exportedKeys).not.toContain('AfterReturning');
      expect(exportedKeys).not.toContain('AfterThrowing');
    });
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have LoggingDecorator', () => {
    const decorator = module.get(LoggingDecorator);
    expect(decorator).toBeDefined();
  });

  it('should have TestService', () => {
    const service = module.get(TestService);
    expect(service).toBeDefined();
  });

  it('should have DiscoveryService', () => {
    expect(discoveryService).toBeDefined();
  });

  it('should export SAOPModule.forRoot() correctly', () => {
    const dynamicModule = SAOPModule.forRoot();
    expect(dynamicModule).toBeDefined();
    expect(dynamicModule.module).toBe(SAOPModule);
    expect(dynamicModule.imports).toContain(DiscoveryModule);
    expect(dynamicModule.global).toBe(true);

    // Verify the structure of the returned module
    expect(dynamicModule).toHaveProperty('module');
    expect(dynamicModule).toHaveProperty('imports');
    expect(dynamicModule).toHaveProperty('global');
  });

  it('should call onModuleInit without errors', async () => {
    const saopModule = module.get(SAOPModule);
    expect(saopModule).toBeDefined();

    // onModuleInit is called automatically by NestJS
    // We just verify the module was created successfully
    expect(saopModule).toBeInstanceOf(SAOPModule);

    // Test that the module has the required services
    expect(typeof (saopModule as any).onModuleInit).toBe('function');

    // Test that services are properly injected
    const instanceCollector = (saopModule as any).instanceCollector;
    const methodProcessor = (saopModule as any).methodProcessor;
    const decoratorApplier = (saopModule as any).decoratorApplier;

    expect(instanceCollector).toBeDefined();
    expect(methodProcessor).toBeDefined();
    expect(decoratorApplier).toBeDefined();

    // Test calling onModuleInit directly to increase coverage
    await (saopModule as any).onModuleInit();
  });

  it('should execute collectAllInstances during onModuleInit', async () => {
    const saopModule = module.get(SAOPModule);
    const instanceCollector = (saopModule as any).instanceCollector;

    // Spy on collectAllInstances to verify it's called
    const collectAllInstancesSpy = jest.spyOn(instanceCollector, 'collectAllInstances');

    await (saopModule as any).onModuleInit();

    expect(collectAllInstancesSpy).toHaveBeenCalled();
    collectAllInstancesSpy.mockRestore();
  });

  it('should handle empty instances in initializeAOP', async () => {
    const saopModule = module.get(SAOPModule);
    const instanceCollector = (saopModule as any).instanceCollector;

    // Mock collectAllInstances to return empty array
    jest.spyOn(instanceCollector, 'collectAllInstances').mockReturnValue([]);

    await (saopModule as any).onModuleInit();

    expect(instanceCollector.collectAllInstances).toHaveBeenCalled();
  });

  it('should handle instances with no methods in processInstance', async () => {
    const saopModule = module.get(SAOPModule);
    const methodProcessor = (saopModule as any).methodProcessor;

    // Mock processInstanceMethods to return empty array
    jest.spyOn(methodProcessor, 'processInstanceMethods').mockReturnValue([]);

    const mockWrapper = { instance: {}, metatype: class Test {} };
    await (saopModule as any).processInstance(mockWrapper);

    expect(methodProcessor.processInstanceMethods).toHaveBeenCalledWith(mockWrapper);
  });

  it('should handle instances with methods in processInstance', async () => {
    const saopModule = module.get(SAOPModule);
    const methodProcessor = (saopModule as any).methodProcessor;
    const instanceCollector = (saopModule as any).instanceCollector;
    const decoratorApplier = (saopModule as any).decoratorApplier;

    // Mock to return methods with decorators
    const mockMethods = [
      { methodName: 'testMethod', decorators: [{ type: 'before', options: {} }] },
    ];
    jest.spyOn(methodProcessor, 'processInstanceMethods').mockReturnValue(mockMethods);
    jest.spyOn(instanceCollector, 'collectSAOPDecorators').mockReturnValue([]);
    jest.spyOn(decoratorApplier, 'applyDecorators').mockImplementation(() => {});

    const mockWrapper = {
      instance: {},
      metatype: class Test {
        testMethod() {}
      },
    };

    await (saopModule as any).processInstance(mockWrapper);

    expect(methodProcessor.processInstanceMethods).toHaveBeenCalledWith(mockWrapper);
    expect(instanceCollector.collectSAOPDecorators).toHaveBeenCalled();
    expect(decoratorApplier.applyDecorators).toHaveBeenCalled();
  });

  it('should handle processMethod with decorators', async () => {
    const saopModule = module.get(SAOPModule);
    const instanceCollector = (saopModule as any).instanceCollector;
    const decoratorApplier = (saopModule as any).decoratorApplier;

    // Mock collectSAOPDecorators to return decorators
    jest
      .spyOn(instanceCollector, 'collectSAOPDecorators')
      .mockReturnValue([module.get(LoggingDecorator)]);
    jest.spyOn(decoratorApplier, 'applyDecorators').mockImplementation(() => {});

    const mockWrapper = { instance: {}, metatype: class Test {} };
    const mockMethod = { methodName: 'testMethod', decorators: [{ type: 'before', options: {} }] };

    await (saopModule as any).processMethod(
      mockWrapper,
      mockMethod.methodName,
      mockMethod.decorators,
      [module.get(LoggingDecorator)],
      () => {},
    );

    expect(decoratorApplier.applyDecorators).toHaveBeenCalled();
  });

  it('should handle multiple instances in initializeAOP', async () => {
    const saopModule = module.get(SAOPModule);
    const instanceCollector = (saopModule as any).instanceCollector;
    const methodProcessor = (saopModule as any).methodProcessor;

    const mockWrapper1 = { instance: {}, metatype: class Test1 {} };
    const mockWrapper2 = { instance: {}, metatype: class Test2 {} };

    // Mock to return multiple instances
    jest
      .spyOn(instanceCollector, 'collectAllInstances')
      .mockReturnValue([mockWrapper1, mockWrapper2]);
    jest.spyOn(methodProcessor, 'processInstanceMethods').mockReturnValue([]);

    await (saopModule as any).onModuleInit();

    expect(instanceCollector.collectAllInstances).toHaveBeenCalled();
    expect(methodProcessor.processInstanceMethods).toHaveBeenCalledTimes(2);
  });

  describe('SAOPModule services', () => {
    let saopModule: SAOPModule;
    let instanceCollector: any;
    let methodProcessor: any;
    let decoratorApplier: any;

    beforeEach(() => {
      saopModule = module.get(SAOPModule);
      instanceCollector = (saopModule as any).instanceCollector;
      methodProcessor = (saopModule as any).methodProcessor;
      decoratorApplier = (saopModule as any).decoratorApplier;
    });

    it('should have InstanceCollector service', () => {
      expect(instanceCollector).toBeDefined();
      expect(typeof instanceCollector.collectAllInstances).toBe('function');
      expect(typeof instanceCollector.collectSAOPDecorators).toBe('function');
    });

    it('should have MethodProcessor service', () => {
      expect(methodProcessor).toBeDefined();
      expect(typeof methodProcessor.processInstanceMethods).toBe('function');
    });

    it('should have DecoratorApplier service', () => {
      expect(decoratorApplier).toBeDefined();
      expect(typeof decoratorApplier.applyDecorators).toBe('function');
    });
  });
});
