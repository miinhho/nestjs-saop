import type { INestApplication } from '@nestjs/common';
import { Controller, Get, Injectable, Module } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import {
  AOPDecorator,
  AOPModule,
  Aspect,
  ErrorAOPContext,
  ResultAOPContext,
  UnitAOPContext,
} from '../../src';

class AOPTracker {
  static beforeCount = 0;
  static afterReturningCount = 0;
  static afterThrowingCount = 0;
  static lastArgs: any[] = [];
  static lastResult: any = null;
  static lastError: any = null;
  static lastBeforeOptions: any = null;
  static lastAfterReturningOptions: any = null;
  static lastAfterThrowingOptions: any = null;
  static allBeforeOptions: any[] = [];

  static reset() {
    this.beforeCount = 0;
    this.afterReturningCount = 0;
    this.afterThrowingCount = 0;
    this.lastArgs = [];
    this.lastResult = null;
    this.lastError = null;
    this.lastBeforeOptions = null;
    this.lastAfterReturningOptions = null;
    this.lastAfterThrowingOptions = null;
    this.allBeforeOptions = [];
  }
}

type ExampleOptions = {
  helloPrefix?: string;
};

@Aspect()
class TestableAOP extends AOPDecorator<ExampleOptions> {
  before({ options }: UnitAOPContext<ExampleOptions>) {
    return (...args: any[]) => {
      AOPTracker.beforeCount++;
      AOPTracker.lastArgs = args;
      AOPTracker.lastBeforeOptions = options;
      AOPTracker.allBeforeOptions.push(options);
    };
  }

  afterReturning({ result, options }: ResultAOPContext<ExampleOptions>) {
    return () => {
      AOPTracker.afterReturningCount++;
      AOPTracker.lastResult = result;
      AOPTracker.lastAfterReturningOptions = options;
    };
  }

  afterThrowing({ error, options }: ErrorAOPContext<ExampleOptions>) {
    return () => {
      AOPTracker.afterThrowingCount++;
      AOPTracker.lastError = error;
      AOPTracker.lastAfterThrowingOptions = options;
    };
  }
}

// AOP without order (should use default order)
@Aspect()
class NoOrderAOP extends AOPDecorator {
  before({ method }: UnitAOPContext) {
    return (...args: any[]) => {
      AOPTracker.beforeCount++;
      AOPTracker.lastArgs = args;
      // For NoOrderAOP, we'll simulate setting the result
      if (method.name === 'getNoOrder') {
        AOPTracker.lastResult = 'No order test';
      }
    };
  }
}

@Injectable()
class CheckTypeErrorService {
  emptyMethod() {
    return 'This method does nothing';
  }
}

// This AOP is to check if there are any type errors when injecting something into AOP classes
@Aspect()
class CheckTypeErrorAOP extends AOPDecorator {
  constructor(private readonly typeErrorService: CheckTypeErrorService) {
    super();
  }

  before({ method }: UnitAOPContext) {
    return () => {
      // Empty implementation
      this.typeErrorService.emptyMethod();
    };
  }
}

@Injectable()
class TestService {
  @TestableAOP.before({
    helloPrefix: 'Hello',
  })
  @TestableAOP.afterReturning()
  getHello(name: string) {
    return `Hello ${name}!`;
  }

  @TestableAOP.before()
  @TestableAOP.afterThrowing()
  getError() {
    throw new Error('This is a test error');
  }

  @TestableAOP.before()
  @TestableAOP.afterReturning()
  getData() {
    return {
      message: 'Test data',
      timestamp: Date.now(),
    };
  }

  @TestableAOP.before()
  @TestableAOP.afterReturning({
    helloPrefix: 'AfterReturning',
  })
  getDataWithOptions() {
    return {
      message: 'Test data with options',
      timestamp: Date.now(),
    };
  }

  @TestableAOP.before()
  @TestableAOP.afterThrowing({
    helloPrefix: 'AfterThrowing',
  })
  getErrorWithOptions() {
    throw new Error('This is a test error with options');
  }

  @TestableAOP.before({
    helloPrefix: 'First',
  })
  @TestableAOP.before({
    helloPrefix: 'Second',
  })
  @TestableAOP.afterReturning({
    helloPrefix: 'AfterReturning',
  })
  getMultipleDecorators() {
    return 'Multiple decorators test';
  }

  @NoOrderAOP.before()
  getNoOrder() {
    return 'No order test';
  }

  @TestableAOP.before({
    helloPrefix: 'Custom',
  })
  getWithCustomOptions() {
    return 'Custom options test';
  }

  @CheckTypeErrorAOP.before()
  checkTypeError() {
    return 'This method is to check type errors in AOP';
  }
}

@Controller()
class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  getHello() {
    return this.testService.getHello('World');
  }

  @Get('error')
  getError() {
    return this.testService.getError();
  }

  @Get('data')
  getData() {
    return this.testService.getData();
  }

  @Get('data-with-options')
  getDataWithOptions() {
    return this.testService.getDataWithOptions();
  }

  @Get('error-with-options')
  getErrorWithOptions() {
    return this.testService.getErrorWithOptions();
  }

  @Get('multiple-decorators')
  getMultipleDecorators() {
    return this.testService.getMultipleDecorators();
  }

  @Get('no-order')
  getNoOrder() {
    return this.testService.getNoOrder();
  }

  @Get('custom-options')
  getWithCustomOptions() {
    return this.testService.getWithCustomOptions();
  }
}

@Module({
  // To make test faster, we use default AOPModule without forRoot
  imports: [AOPModule],
  controllers: [TestController],
  providers: [TestService, TestableAOP, NoOrderAOP, CheckTypeErrorAOP, CheckTypeErrorService],
})
class TestModule {}

describe('AOP in Nest.js (e2e test)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    AOPTracker.reset();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) - should return hello message with AOP tracking', async () => {
    return request
      .default(app.getHttpServer())
      .get('/')
      .then(() => {
        // Check if AOP advice was executed
        expect(AOPTracker.beforeCount).toBeGreaterThan(0);
        expect(AOPTracker.afterReturningCount).toBeGreaterThan(0);
        expect(AOPTracker.lastResult).toBe('Hello World!');
      });
  });

  it('/error (GET) - should handle error with AOP tracking', async () => {
    return request
      .default(app.getHttpServer())
      .get('/error')
      .then(() => {
        // Check if AOP advice was executed
        expect(AOPTracker.beforeCount).toBeGreaterThan(0);
        expect(AOPTracker.afterThrowingCount).toBeGreaterThan(0);
        expect(AOPTracker.lastError).toBeInstanceOf(Error);
        expect(AOPTracker.lastError.message).toBe('This is a test error');
      });
  });

  it('/data (GET) - should return data with AOP tracking', async () => {
    return request
      .default(app.getHttpServer())
      .get('/data')
      .then(() => {
        // Check if AOP advice was executed
        expect(AOPTracker.beforeCount).toBeGreaterThan(0);
        expect(AOPTracker.afterReturningCount).toBeGreaterThan(0);
        expect(AOPTracker.lastResult).toHaveProperty('message', 'Test data');
        expect(AOPTracker.lastResult).toHaveProperty('timestamp');
      });
  });

  it('should verify AOP before advice execution', () => {
    const initialBeforeCount = AOPTracker.beforeCount;

    return request
      .default(app.getHttpServer())
      .get('/')
      .then(() => {
        // Check if AOP before advice was executed
        expect(AOPTracker.beforeCount).toBeGreaterThan(initialBeforeCount);
        expect(AOPTracker.lastArgs).toEqual(['World']);
      });
  });

  it('should verify AOP afterReturning advice execution', async () => {
    const initialAfterReturningCount = AOPTracker.afterReturningCount;

    return request
      .default(app.getHttpServer())
      .get('/data')
      .then(() => {
        // Check if AOP afterReturning advice was executed
        expect(AOPTracker.afterReturningCount).toBeGreaterThan(initialAfterReturningCount);
        expect(AOPTracker.lastResult).toHaveProperty('message');
        expect(AOPTracker.lastResult).toHaveProperty('timestamp');
      });
  });

  it('should verify AOP afterThrowing advice execution', async () => {
    const initialAfterThrowingCount = AOPTracker.afterThrowingCount;

    return request
      .default(app.getHttpServer())
      .get('/error')
      .then(() => {
        // Check if AOP afterThrowing advice was executed
        expect(AOPTracker.afterThrowingCount).toBeGreaterThan(initialAfterThrowingCount);
        expect(AOPTracker.lastError).toBeInstanceOf(Error);
        expect(AOPTracker.lastError.message).toBe('This is a test error');
      });
  });

  it('should verify AOP options are passed correctly', async () => {
    return request
      .default(app.getHttpServer())
      .get('/')
      .then(() => {
        // Check if options are passed correctly to before advice
        expect(AOPTracker.lastBeforeOptions).toEqual({ helloPrefix: 'Hello' });
      });
  });

  it('should verify AOP options are passed correctly to afterReturning', async () => {
    AOPTracker.reset();
    return request
      .default(app.getHttpServer())
      .get('/data-with-options')
      .then(() => {
        // Check if options are passed correctly to afterReturning advice
        expect(AOPTracker.lastAfterReturningOptions).toEqual({ helloPrefix: 'AfterReturning' });
      });
  });

  it('should verify AOP options are passed correctly to afterThrowing', async () => {
    AOPTracker.reset();
    return request
      .default(app.getHttpServer())
      .get('/error-with-options')
      .then(() => {
        // Check if options are passed correctly to afterThrowing advice
        expect(AOPTracker.lastAfterThrowingOptions).toEqual({ helloPrefix: 'AfterThrowing' });
      });
  });

  it('should handle multiple decorators with different options', async () => {
    AOPTracker.reset();
    return request
      .default(app.getHttpServer())
      .get('/multiple-decorators')
      .then(() => {
        // Check if multiple before decorators with different options are handled correctly
        // The options should be unique and in the correct order
        const uniqueOptions = [...new Set(AOPTracker.allBeforeOptions.map(opt => opt.helloPrefix))];
        expect(uniqueOptions).toEqual(['Second', 'First']);
        expect(AOPTracker.lastAfterReturningOptions).toEqual({ helloPrefix: 'AfterReturning' });
        expect(AOPTracker.lastResult).toBe('Multiple decorators test');
      });
  });

  it('should handle empty options object', async () => {
    AOPTracker.reset();
    // Test with empty options - this should work without issues
    return request
      .default(app.getHttpServer())
      .get('/data')
      .then(() => {
        expect(AOPTracker.lastAfterReturningOptions).toEqual({});
      });
  });

  it('should handle custom options correctly', async () => {
    return request
      .default(app.getHttpServer())
      .get('/custom-options')
      .then(() => {
        // Check if custom options are passed correctly
        expect(AOPTracker.lastBeforeOptions).toEqual({ helloPrefix: 'Custom' });
      });
  });

  it('should handle AOP without order (default order)', async () => {
    return request
      .default(app.getHttpServer())
      .get('/no-order')
      .then(() => {
        // Check if AOP without explicit order works
        expect(AOPTracker.beforeCount).toBeGreaterThan(0);
        expect(AOPTracker.lastResult).toBe('No order test');
      });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
