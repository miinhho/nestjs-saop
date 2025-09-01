import type { INestApplication } from '@nestjs/common';
import { Controller, Get, Injectable, Module } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AOPDecorator, AOPModule, Aspect } from '../../src';

class AOPTracker {
  static beforeCount = 0;
  static afterReturningCount = 0;
  static afterThrowingCount = 0;
  static lastMethodName = '';
  static lastArgs: any[] = [];
  static lastResult: any = null;
  static lastError: any = null;

  static reset() {
    this.beforeCount = 0;
    this.afterReturningCount = 0;
    this.afterThrowingCount = 0;
    this.lastMethodName = '';
    this.lastArgs = [];
    this.lastResult = null;
    this.lastError = null;
  }
}

@Aspect()
class TestableAOP extends AOPDecorator {
  before({ method }: any) {
    return (...args: any[]) => {
      AOPTracker.beforeCount++;
      AOPTracker.lastMethodName = method.name;
      AOPTracker.lastArgs = args;
    };
  }

  afterReturning({ method, result }: any) {
    return (...args: any[]) => {
      AOPTracker.afterReturningCount++;
      AOPTracker.lastMethodName = method.name;
      AOPTracker.lastResult = result;
    };
  }

  afterThrowing({ method, error }: any) {
    return (...args: any[]) => {
      AOPTracker.afterThrowingCount++;
      AOPTracker.lastMethodName = method.name;
      AOPTracker.lastError = error;
    };
  }
}

@Injectable()
class TestService {
  @TestableAOP.before()
  @TestableAOP.afterReturning()
  getHello(name: string): string {
    return `Hello ${name}!`;
  }

  @TestableAOP.before()
  @TestableAOP.afterThrowing()
  getError(): string {
    throw new Error('This is a test error');
  }

  @TestableAOP.before()
  @TestableAOP.afterReturning()
  getData(): { message: string; timestamp: number } {
    return {
      message: 'Test data',
      timestamp: Date.now(),
    };
  }
}

@Controller()
class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  getHello(): string {
    return this.testService.getHello('World');
  }

  @Get('error')
  getError(): string {
    return this.testService.getError();
  }

  @Get('data')
  getData(): { message: string; timestamp: number } {
    return this.testService.getData();
  }
}

@Module({
  imports: [AOPModule.forRoot()],
  controllers: [TestController],
  providers: [TestService, TestableAOP],
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

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
