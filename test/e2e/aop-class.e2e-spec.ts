import { Controller, Get, INestApplication, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AOPDecorator, AOPMethod, AOPModule, AroundAOPContext, Aspect } from '../../src';

class AOPTracker {
  static count = 0;

  static reset() {
    this.count = 0;
  }
}

@Aspect()
class TestAOPDecorator extends AOPDecorator {
  around({ proceed }: AroundAOPContext): AOPMethod {
    return (...args: any[]) => {
      const result = proceed(args);
      AOPTracker.count += 1;
      return result;
    };
  }
}

@Injectable()
@TestAOPDecorator.around()
class TestService {
  getHello(name: string) {
    return `Hello ${name}!`;
  }
}

@Controller()
class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  getHello() {
    return this.testService.getHello('World');
  }
}

@Module({
  // To make test faster, we use default AOPModule without forRoot
  imports: [AOPModule],
  controllers: [TestController],
  providers: [TestService, TestAOPDecorator],
})
class TestModule {}

describe('AOP Class in Nest.js (e2e test)', () => {
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
        expect(AOPTracker.count).toBeGreaterThan(0);
      });
  });
});
