import { INestApplication, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AOPDecorator, AOPMethod, AOPModule, AroundAOPContext, Aspect } from '../../src';

// Records which methods the class-level aspect actually wrapped.
const wrapped: string[] = [];

@Aspect()
class TestAOPDecorator extends AOPDecorator {
  around({ method, proceed }: AroundAOPContext): AOPMethod {
    return (...args: any[]) => {
      wrapped.push(method.name);
      return proceed(...args);
    };
  }
}

// The class-level decorator must apply the around advice to every public method.
@Injectable()
@TestAOPDecorator.around()
class TestService {
  greet(name: string) {
    return `Hello ${name}!`;
  }

  add(a: number, b: number) {
    return a + b;
  }

  noArgs() {
    return 'constant';
  }
}

@Module({
  // To make test faster, we use default AOPModule without forRoot
  imports: [AOPModule],
  providers: [TestService, TestAOPDecorator],
})
class TestModule {}

describe('Class-level AOP in Nest.js (e2e test)', () => {
  let app: INestApplication;
  let service: TestService;

  beforeEach(async () => {
    wrapped.length = 0;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    service = app.get(TestService);
  });

  afterEach(async () => {
    await app?.close();
  });

  it('should apply the advice to every public method of the class', () => {
    service.greet('World');
    service.add(2, 3);
    service.noArgs();

    // The around advice wrapped all three methods.
    expect(wrapped).toEqual(['greet', 'add', 'noArgs']);
  });

  it('should preserve arguments and return values through the wrapper', () => {
    expect(service.greet('World')).toBe('Hello World!');
    expect(service.add(2, 3)).toBe(5);
    expect(service.noArgs()).toBe('constant');
  });

  it('should run the advice once per call', () => {
    service.greet('A');
    service.greet('B');

    expect(wrapped).toEqual(['greet', 'greet']);
  });
});
