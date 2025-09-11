import type { INestApplication } from '@nestjs/common';
import { Controller, Get, Injectable, Module } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AOPDecorator, AOPModule, Aspect } from '../../src';

class AOPTracker {
  static executionOrder: string[] = [];

  static reset() {
    this.executionOrder = [];
  }
}

@Aspect({ order: 1 })
class FirstAOP extends AOPDecorator {
  before() {
    return () => {
      AOPTracker.executionOrder.push('First');
    };
  }
}

@Aspect({ order: 2 })
class SecondAOP extends AOPDecorator {
  before() {
    return () => {
      AOPTracker.executionOrder.push('Second');
    };
  }
}

@Aspect({ order: 3 })
class ThirdAOP extends AOPDecorator {
  before() {
    return () => {
      AOPTracker.executionOrder.push('Third');
    };
  }
}

@Injectable()
class TestService {
  @FirstAOP.before()
  @SecondAOP.before()
  @ThirdAOP.before()
  getOrdered(): string {
    return 'Ordered AOP executed';
  }
}

@Controller()
class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('ordered')
  getOrdered(): string {
    return this.testService.getOrdered();
  }
}

@Module({
  imports: [AOPModule.forRoot()],
  controllers: [TestController],
  providers: [TestService, FirstAOP, SecondAOP, ThirdAOP],
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

  it('/ordered (GET) - should execute AOP in order of small order values', async () => {
    return request
      .default(app.getHttpServer())
      .get('/ordered')
      .then(() => {
        // Check if AOPs were executed in order: First (order 1), Second (order 2), Third (order 3)
        // Take the first 3 executions to avoid duplicates from multiple calls
        expect(AOPTracker.executionOrder.slice(0, 3)).toEqual(['First', 'Second', 'Third']);
      });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
