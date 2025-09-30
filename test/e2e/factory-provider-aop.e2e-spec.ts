import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { AOPDecorator, AOPModule, Aspect, UnitAOPContext } from '../../src';

// Test tracking
const callLog: string[] = [];

@Aspect({ order: 1 })
class LoggingAspect extends AOPDecorator {
  before({ method }: UnitAOPContext) {
    return (...args: any[]) => {
      callLog.push(`BEFORE:${method.name}:${JSON.stringify(args)}`);
    };
  }

  after({ method }: UnitAOPContext) {
    return () => {
      callLog.push(`AFTER:${method.name}`);
    };
  }
}

@Aspect({ order: 2 })
class TimingAspect extends AOPDecorator {
  before({ method }: UnitAOPContext) {
    return () => {
      callLog.push(`TIMING_START:${method.name}`);
    };
  }

  after({ method }: UnitAOPContext) {
    return () => {
      callLog.push(`TIMING_END:${method.name}`);
    };
  }
}

// Simple service for basic factory provider tests
@Injectable()
class SimpleService {
  constructor(private readonly name: string = 'default') {}

  @LoggingAspect.before()
  getName(): string {
    console.log('[getName] this:', this);
    console.log('[getName] this.name:', this.name);
    return `Hello ${this.name}`;
  }

  getPlainName(): string {
    return `Plain ${this.name}`;
  }
}

@Injectable()
class FactoryService {
  private readonly prefix: string;

  constructor(prefix: string = 'default') {
    this.prefix = prefix;
  }

  @LoggingAspect.before()
  simpleMethod(): string {
    return `${this.prefix}: simple`;
  }

  @TimingAspect.before()
  @LoggingAspect.before()
  multiDecoratorMethod(): string {
    return `${this.prefix}: multi`;
  }

  @LoggingAspect.before()
  methodWithArgs(arg1: string, arg2: number): string {
    return `${this.prefix}: ${arg1}-${arg2}`;
  }

  @LoggingAspect.before()
  async asyncMethod(): Promise<string> {
    return Promise.resolve(`${this.prefix}: async`);
  }

  plainMethod(): string {
    return `${this.prefix}: plain`;
  }
}

@Injectable()
class ComplexFactoryService {
  constructor(
    private readonly config: { name: string; value: number },
    private readonly dependency: string,
  ) {}

  @LoggingAspect.before()
  getConfig(): any {
    return {
      name: this.config.name,
      value: this.config.value,
      dependency: this.dependency,
    };
  }

  @TimingAspect.before()
  calculate(multiplier: number): number {
    return this.config.value * multiplier;
  }
}

@Controller('factory-test')
class FactoryTestController {
  constructor(
    private readonly factoryService: FactoryService,
    private readonly complexService: ComplexFactoryService,
  ) {}

  @Get('simple')
  @LoggingAspect.before()
  getSimple(): string {
    return this.factoryService.simpleMethod();
  }

  @Get('complex')
  getComplex(): any {
    return this.complexService.getConfig();
  }
}

@Module({
  imports: [AOPModule.forRoot()],
  providers: [
    LoggingAspect,
    TimingAspect,
    {
      provide: FactoryService,
      useFactory: () => {
        return new FactoryService('factory-created');
      },
    },
    { provide: 'CONFIG', useValue: { name: 'test', value: 42 } },
    { provide: 'DEPENDENCY', useValue: 'injected-dep' },
    {
      provide: ComplexFactoryService,
      useFactory: (config: any, dep: string) => {
        return new ComplexFactoryService(config, dep);
      },
      inject: ['CONFIG', 'DEPENDENCY'],
    },
  ],
  controllers: [FactoryTestController],
})
class FactoryTestModule {}

describe('Factory Provider AOP Integration (e2e)', () => {
  let app: TestingModule;
  let factoryService: FactoryService;
  let complexService: ComplexFactoryService;
  let controller: FactoryTestController;

  // Helper function to clear call log
  const clearCallLog = () => {
    callLog.length = 0;
  };

  afterEach(async () => {
    if (app) {
      await app.close();
      app = null as any;
    }
  });

  describe('Basic Factory Provider Tests', () => {
    beforeEach(() => {
      clearCallLog();
    });

    it('should work with simple factory provider', async () => {
      @Module({
        imports: [AOPModule.forRoot()],
        providers: [
          LoggingAspect,
          {
            provide: SimpleService,
            useFactory: () => {
              console.log('[Factory] Creating instance with "factory-created"');
              const instance = new SimpleService('factory-created');
              console.log('[Factory] Instance created:', instance);
              console.log('[Factory] Instance constructor name:', instance.constructor.name);
              console.log('[Factory] Instance getName method:', typeof instance.getName);
              return instance;
            },
          },
        ],
      })
      class BasicFactoryModule {}

      app = await Test.createTestingModule({
        imports: [BasicFactoryModule],
      }).compile();

      await app.init();

      const service = app.get<SimpleService>(SimpleService);
      console.log('[Factory] Retrieved service:', service);
      console.log('[Factory] Service constructor name:', service.constructor.name);
      console.log('[Factory] Service getName method:', typeof service.getName);

      const result = service.getName();

      console.log('[Factory] Result:', result);
      console.log('[Factory] CallLog:', callLog);

      expect(result).toBe('Hello factory-created');
      expect(callLog).toContain('BEFORE:getName:[]');
    });

    it('should not intercept plain methods', async () => {
      @Module({
        imports: [AOPModule.forRoot()],
        providers: [
          LoggingAspect,
          {
            provide: SimpleService,
            useFactory: () => new SimpleService('factory-test'),
          },
        ],
      })
      class PlainModule {}

      app = await Test.createTestingModule({
        imports: [PlainModule],
      }).compile();

      await app.init();

      const service = app.get<SimpleService>(SimpleService);
      const result = service.getPlainName();

      console.log('[Plain] Result:', result);
      console.log('[Plain] CallLog:', callLog);

      expect(result).toBe('Plain factory-test');
      expect(callLog).toEqual([]); // No AOP interception
    });
  });

  describe('Advanced Factory Provider Tests', () => {
    beforeEach(async () => {
      // Clear call log before each test
      clearCallLog();

      app = await Test.createTestingModule({
        imports: [FactoryTestModule],
      }).compile();

      await app.init();

      factoryService = app.get<FactoryService>(FactoryService);
      complexService = app.get<ComplexFactoryService>(ComplexFactoryService);
      controller = app.get<FactoryTestController>(FactoryTestController);
    });

    describe('Simple Factory Provider', () => {
      it('should apply AOP decorators to factory-created service methods', () => {
        const result = factoryService.simpleMethod();

        expect(result).toBe('factory-created: simple');
        expect(callLog).toEqual(['BEFORE:simpleMethod:[]']);
      });

      it('should handle multiple decorators on factory service methods', () => {
        const result = factoryService.multiDecoratorMethod();

        expect(result).toBe('factory-created: multi');
        // Both decorators should be applied
        expect(callLog).toEqual([
          'BEFORE:multiDecoratorMethod:[]',
          'TIMING_START:multiDecoratorMethod',
        ]);
      });

      it('should preserve method arguments in factory service', () => {
        const result = factoryService.methodWithArgs('test', 123);

        expect(result).toBe('factory-created: test-123');
        expect(callLog).toEqual(['BEFORE:methodWithArgs:["test",123]']);
      });

      it('should handle async methods in factory service', async () => {
        const result = await factoryService.asyncMethod();

        expect(result).toBe('factory-created: async');
        expect(callLog).toEqual(['BEFORE:asyncMethod:[]']);
      });

      it('should not intercept methods without decorators', () => {
        const result = factoryService.plainMethod();

        expect(result).toBe('factory-created: plain');
        expect(callLog).toEqual([]); // No AOP calls
      });
    });

    describe('Complex Factory Provider with Dependencies', () => {
      it('should apply AOP to factory service with injected dependencies', () => {
        const result = complexService.getConfig();

        expect(result).toEqual({
          name: 'test',
          value: 42,
          dependency: 'injected-dep',
        });
        expect(callLog).toEqual(['BEFORE:getConfig:[]']);
      });

      it('should work with factory service methods that use injected values', () => {
        const result = complexService.calculate(2);

        expect(result).toBe(84); // 42 * 2
        expect(callLog).toEqual(['TIMING_START:calculate']);
      });
    });

    describe('Controller with Factory Services', () => {
      it('should apply AOP to controller methods using factory services', () => {
        const result = controller.getSimple();

        expect(result).toBe('factory-created: simple');
        // Both controller method and service method should be intercepted
        expect(callLog).toContain('BEFORE:getSimple:[]'); // Controller method
        expect(callLog).toContain('BEFORE:simpleMethod:[]'); // Service method
      });

      it('should work with controller calling factory service without controller decorators', () => {
        const result = controller.getComplex();

        expect(result).toEqual({
          name: 'test',
          value: 42,
          dependency: 'injected-dep',
        });
        // Only service method should be intercepted (no decorator on controller method)
        expect(callLog).toEqual(['BEFORE:getConfig:[]']);
      });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      clearCallLog();
    });

    it('should handle factory that returns null/undefined gracefully', async () => {
      const edgeModule = await Test.createTestingModule({
        imports: [AOPModule.forRoot()],
        providers: [
          LoggingAspect,
          {
            provide: 'NULL_SERVICE',
            useFactory: () => null,
          },
        ],
      }).compile();

      await edgeModule.init();

      // Should not throw during module initialization
      expect(edgeModule).toBeDefined();

      await edgeModule.close();
    });

    it('should handle complex factory with multiple return types', async () => {
      class MultiTypeService {
        @LoggingAspect.before()
        getValue(): string {
          return 'multi-type';
        }
      }

      const multiModule = await Test.createTestingModule({
        imports: [AOPModule.forRoot()],
        providers: [
          LoggingAspect,
          {
            provide: 'MULTI_SERVICE',
            useFactory: (): MultiTypeService => {
              // Factory can have complex logic
              const condition = Math.random() > -1; // Always true
              return condition ? new MultiTypeService() : new MultiTypeService();
            },
          },
        ],
      }).compile();

      await multiModule.init();
      const service = multiModule.get<MultiTypeService>('MULTI_SERVICE');

      clearCallLog();
      const result = service.getValue();

      expect(result).toBe('multi-type');
      expect(callLog).toEqual(['BEFORE:getValue:[]']);

      await multiModule.close();
    });
  });
});
