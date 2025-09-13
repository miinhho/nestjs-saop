import type { INestApplication } from '@nestjs/common';
import { Controller, Get, Injectable, Module } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import {
  AOPDecorator,
  AOPModule,
  AroundAOPContext,
  Aspect,
  ErrorAOPContext,
  ResultAOPContext,
} from '../../src';

class AOPTracker {
  static executionOrder: string[] = [];
  static methodResults: any[] = [];
  static exceptions: Error[] = [];

  static reset() {
    this.executionOrder = [];
    this.methodResults = [];
    this.exceptions = [];
  }
}

@Aspect({ order: 1 })
class FirstAOP extends AOPDecorator {
  before() {
    return () => {
      AOPTracker.executionOrder.push('First-Before');
    };
  }
}

@Aspect({ order: 2 })
class SecondAOP extends AOPDecorator {
  before() {
    return () => {
      AOPTracker.executionOrder.push('Second-Before');
    };
  }
}

@Aspect({ order: 3 })
class ThirdAOP extends AOPDecorator {
  before() {
    return () => {
      AOPTracker.executionOrder.push('Third-Before');
    };
  }
}

@Aspect({ order: -1 })
class NegativeOrderAOP extends AOPDecorator {
  before() {
    return () => {
      AOPTracker.executionOrder.push('Negative-Before');
    };
  }
}

@Aspect({ order: 100 })
class HighOrderAOP extends AOPDecorator {
  before() {
    return () => {
      AOPTracker.executionOrder.push('High-Before');
    };
  }
}

@Aspect({ order: 1 })
class ComplexAOP extends AOPDecorator {
  before() {
    return () => {
      AOPTracker.executionOrder.push('Complex-Before');
    };
  }

  afterReturning({ result }: ResultAOPContext) {
    return () => {
      AOPTracker.executionOrder.push('Complex-AfterReturning');
      AOPTracker.methodResults.push(result);
    };
  }

  afterThrowing({ error }: ErrorAOPContext) {
    return () => {
      AOPTracker.executionOrder.push('Complex-AfterThrowing');
      AOPTracker.exceptions.push(error as Error);
    };
  }
}

@Aspect({ order: 2 })
class AsyncAOP extends AOPDecorator {
  around({ proceed }: AroundAOPContext) {
    return (...args: any[]) => {
      AOPTracker.executionOrder.push('Async-Around-Before');
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const result = proceed(...args);
            AOPTracker.executionOrder.push('Async-Around-After');
            resolve(result);
          } catch (error) {
            AOPTracker.executionOrder.push('Async-Around-Error');
            reject(error);
          }
        }, 10);
      });
    };
  }
}

@Injectable()
class TestService {
  @FirstAOP.before()
  @SecondAOP.before()
  @ThirdAOP.before()
  getOrdered() {
    AOPTracker.executionOrder.push('Method-Execution');
    return 'ordered-result';
  }

  @NegativeOrderAOP.before()
  @FirstAOP.before()
  getNegativeOrder() {
    AOPTracker.executionOrder.push('Negative-Method');
    return 'negative-result';
  }

  @HighOrderAOP.before()
  @FirstAOP.before()
  getHighOrder() {
    AOPTracker.executionOrder.push('High-Method');
    return 'high-result';
  }

  @ComplexAOP.before()
  @ComplexAOP.afterReturning()
  getComplex() {
    AOPTracker.executionOrder.push('Complex-Method');
    return 'complex-result';
  }

  @ComplexAOP.before()
  @ComplexAOP.afterThrowing()
  throwError() {
    AOPTracker.executionOrder.push('Error-Method');
    throw new Error('test-error');
  }

  @AsyncAOP.around()
  async getAsync() {
    AOPTracker.executionOrder.push('Async-Method');
    return 'async-result';
  }
}

@Controller()
class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('/ordered')
  getOrdered() {
    return this.testService.getOrdered();
  }

  @Get('/negative-order')
  getNegativeOrder() {
    return this.testService.getNegativeOrder();
  }

  @Get('/high-order')
  getHighOrder() {
    return this.testService.getHighOrder();
  }

  @Get('/complex')
  getComplex() {
    return this.testService.getComplex();
  }

  @Get('/error')
  getError() {
    return this.testService.throwError();
  }

  @Get('/async')
  async getAsync() {
    return await this.testService.getAsync();
  }
}

@Module({
  // To make test faster, we use default AOPModule without forRoot
  imports: [AOPModule],
  controllers: [TestController],
  providers: [
    TestService,
    FirstAOP,
    SecondAOP,
    ThirdAOP,
    NegativeOrderAOP,
    HighOrderAOP,
    ComplexAOP,
    AsyncAOP,
  ],
})
class TestModule {}

describe('AOP Order in Nest.js (e2e test)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    AOPTracker.reset();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('AOP Execution Order', () => {
    it('should execute AOPs in ascending order of priority values', async () => {
      await request.default(app.getHttpServer()).get('/ordered');

      expect(AOPTracker.executionOrder.slice(0, 4)).toEqual([
        'First-Before',
        'Second-Before',
        'Third-Before',
        'Method-Execution',
      ]);
    });

    it('should handle negative order values correctly', async () => {
      await request.default(app.getHttpServer()).get('/negative-order');

      expect(AOPTracker.executionOrder.slice(0, 3)).toEqual([
        'Negative-Before',
        'First-Before',
        'Negative-Method',
      ]);
    });

    it('should execute high order values after low order values', async () => {
      await request.default(app.getHttpServer()).get('/high-order');

      expect(AOPTracker.executionOrder.slice(0, 3)).toEqual([
        'First-Before',
        'High-Before',
        'High-Method',
      ]);
    });
  });

  describe('AOP Types', () => {
    it('should handle before and afterReturning correctly', async () => {
      await request.default(app.getHttpServer()).get('/complex');

      expect(AOPTracker.executionOrder).toEqual([
        'Complex-Before',
        'Complex-Method',
        'Complex-AfterReturning',
      ]);
      expect(AOPTracker.methodResults).toContain('complex-result');
    });

    it('should handle exceptions with afterThrowing', async () => {
      await request.default(app.getHttpServer()).get('/error').expect(500);

      expect(AOPTracker.executionOrder).toEqual([
        'Complex-Before',
        'Error-Method',
        'Complex-AfterThrowing',
      ]);
      expect(AOPTracker.exceptions[0]?.message).toBe('test-error');
    });

    it('should handle async methods with around AOP', async () => {
      await request.default(app.getHttpServer()).get('/async');

      expect(AOPTracker.executionOrder).toEqual([
        'Async-Around-Before',
        'Async-Method',
        'Async-Around-After',
      ]);
    });
  });

  afterAll(async () => {
    await app?.close();
  });
});
