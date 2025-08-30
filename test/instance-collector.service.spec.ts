import { DiscoveryService } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { SAOPModule } from '../src/saop.module';
import { LoggingDecorator } from './app/logging.decorator';

describe('InstanceCollectorService', () => {
  let module: TestingModule;
  let discoveryService: DiscoveryService;
  let instanceCollector: any;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [SAOPModule.forRoot()],
      providers: [LoggingDecorator],
    }).compile();

    discoveryService = module.get(DiscoveryService);
    const saopModule = module.get(SAOPModule);
    instanceCollector = (saopModule as any).instanceCollector;
  });

  it('should return empty array when no SAOPDecorators found', () => {
    // Mock discovery service to return empty providers
    jest.spyOn(discoveryService, 'getProviders').mockReturnValue([]);

    const result = instanceCollector.collectSAOPDecorators();
    expect(result).toEqual([]);
  });

  it('should find SAOPDecorators from providers', () => {
    const mockProvider = {
      instance: module.get(LoggingDecorator),
      metatype: LoggingDecorator,
      name: 'LoggingDecorator',
      token: LoggingDecorator,
      isAlias: false,
    } as any;

    jest.spyOn(discoveryService, 'getProviders').mockReturnValue([mockProvider]);

    const result = instanceCollector.collectSAOPDecorators();
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(LoggingDecorator);
  });

  it('should skip providers without instance', () => {
    const mockProvider = {
      instance: null,
      metatype: LoggingDecorator,
      name: 'LoggingDecorator',
      token: LoggingDecorator,
      isAlias: false,
    } as any;

    jest.spyOn(discoveryService, 'getProviders').mockReturnValue([mockProvider]);

    const result = instanceCollector.collectSAOPDecorators();
    expect(result).toHaveLength(0);
  });

  it('should skip providers that are not objects', () => {
    const mockProvider = {
      instance: 'not an object',
      metatype: LoggingDecorator,
      name: 'LoggingDecorator',
      token: LoggingDecorator,
      isAlias: false,
    } as any;

    jest.spyOn(discoveryService, 'getProviders').mockReturnValue([mockProvider]);

    const result = instanceCollector.collectSAOPDecorators();
    expect(result).toHaveLength(0);
  });

  it('should skip providers without SAOPDecorator methods', () => {
    const mockProvider = {
      instance: { someOtherMethod: () => {} },
      metatype: LoggingDecorator,
      name: 'LoggingDecorator',
      token: LoggingDecorator,
      isAlias: false,
    } as any;

    jest.spyOn(discoveryService, 'getProviders').mockReturnValue([mockProvider]);

    const result = instanceCollector.collectSAOPDecorators();
    expect(result).toHaveLength(0);
  });

  it('should collect all instances from controllers and providers', () => {
    const mockController = {
      instance: 'controller1',
      metatype: class Controller {},
      name: 'TestController',
      token: 'TestController',
      isAlias: false,
    } as any;

    const mockProvider = {
      instance: 'provider1',
      metatype: class Provider {},
      name: 'TestProvider',
      token: 'TestProvider',
      isAlias: false,
    } as any;

    jest.spyOn(discoveryService, 'getControllers').mockReturnValue([mockController]);
    jest.spyOn(discoveryService, 'getProviders').mockReturnValue([mockProvider]);

    const result = instanceCollector.collectAllInstances();
    expect(result).toEqual([mockController, mockProvider]);
  });

  it('should handle empty controllers and providers', () => {
    jest.spyOn(discoveryService, 'getControllers').mockReturnValue([]);
    jest.spyOn(discoveryService, 'getProviders').mockReturnValue([]);

    const result = instanceCollector.collectAllInstances();
    expect(result).toEqual([]);
  });

  it('should skip providers with undefined instance', () => {
    const mockProvider = {
      instance: undefined,
      metatype: LoggingDecorator,
      name: 'LoggingDecorator',
      token: LoggingDecorator,
      isAlias: false,
    } as any;

    jest.spyOn(discoveryService, 'getProviders').mockReturnValue([mockProvider]);

    const result = instanceCollector.collectSAOPDecorators();
    expect(result).toHaveLength(0);
  });

  it('should skip providers with null instance', () => {
    const mockProvider = {
      instance: null,
      metatype: LoggingDecorator,
      name: 'LoggingDecorator',
      token: LoggingDecorator,
      isAlias: false,
    } as any;

    jest.spyOn(discoveryService, 'getProviders').mockReturnValue([mockProvider]);

    const result = instanceCollector.collectSAOPDecorators();
    expect(result).toHaveLength(0);
  });

  it('should find SAOPDecorators with mixed method combinations', () => {
    const mockProvider1 = {
      instance: {
        around: () => {},
        before: () => {},
      },
      metatype: LoggingDecorator,
      name: 'LoggingDecorator1',
      token: LoggingDecorator,
      isAlias: false,
    } as any;

    const mockProvider2 = {
      instance: {
        afterReturning: () => {},
        afterThrowing: () => {},
      },
      metatype: LoggingDecorator,
      name: 'LoggingDecorator2',
      token: LoggingDecorator,
      isAlias: false,
    } as any;

    const mockProvider3 = {
      instance: {
        after: () => {},
      },
      metatype: LoggingDecorator,
      name: 'LoggingDecorator3',
      token: LoggingDecorator,
      isAlias: false,
    } as any;

    jest
      .spyOn(discoveryService, 'getProviders')
      .mockReturnValue([mockProvider1, mockProvider2, mockProvider3]);

    const result = instanceCollector.collectSAOPDecorators();
    expect(result).toHaveLength(3);
    expect(result).toEqual([
      mockProvider1.instance,
      mockProvider2.instance,
      mockProvider3.instance,
    ]);
  });

  it('should execute collectAllInstances method successfully', () => {
    // This test ensures the collectAllInstances method is actually executed
    const mockController = {
      instance: 'controller1',
      metatype: class Controller {},
      name: 'TestController',
      token: 'TestController',
      isAlias: false,
    } as any;

    const mockProvider = {
      instance: 'provider1',
      metatype: class Provider {},
      name: 'TestProvider',
      token: 'TestProvider',
      isAlias: false,
    } as any;

    jest.spyOn(discoveryService, 'getControllers').mockReturnValue([mockController]);
    jest.spyOn(discoveryService, 'getProviders').mockReturnValue([mockProvider]);

    // Call the method directly to ensure it's executed
    const result = instanceCollector.collectAllInstances();

    expect(result).toHaveLength(2);
    expect(result).toEqual([mockController, mockProvider]);
  });
});
