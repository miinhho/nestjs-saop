import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AOPDecorator,
  AOPMethod,
  AOPModule,
  AroundAOPContext,
  Aspect,
  ErrorAOPContext,
  ResultAOPContext,
} from '../../src';

const trace: string[] = [];

// Records the full advice lifecycle around a method.
@Aspect()
class CycleAspect extends AOPDecorator {
  around({ proceed }: AroundAOPContext): AOPMethod {
    return (...args: any[]) => {
      trace.push('around:before');
      const result = proceed(...args);
      trace.push('around:after');
      return result;
    };
  }
  before() {
    return () => trace.push('before');
  }
  after() {
    return () => trace.push('after');
  }
  afterReturning({ result }: ResultAOPContext) {
    return () => trace.push(`afterReturning:${result}`);
  }
  afterThrowing({ error }: ErrorAOPContext<any, Error>) {
    return () => trace.push(`afterThrowing:${error?.message}`);
  }
}

// Around advice that rewrites the incoming arguments and the outgoing result.
@Aspect()
class TransformAspect extends AOPDecorator {
  around({ proceed }: AroundAOPContext): AOPMethod {
    return (...args: any[]) => {
      const doubled = args.map((a: number) => a * 2);
      const result = proceed(...doubled);
      return result + 100;
    };
  }
}

// Around advice that can skip the method entirely.
@Aspect()
class GuardAspect extends AOPDecorator {
  around({ proceed, options }: AroundAOPContext): AOPMethod {
    return (...args: any[]) => {
      if (options.skip) return 'short-circuited';
      return proceed(...args);
    };
  }
}

@Aspect({ order: 1 })
class OuterAspect extends AOPDecorator {
  around({ proceed }: AroundAOPContext): AOPMethod {
    return (...args: any[]) => {
      trace.push('outer:before');
      const result = proceed(...args);
      trace.push('outer:after');
      return result;
    };
  }
}

@Aspect({ order: 2 })
class InnerAspect extends AOPDecorator {
  around({ proceed }: AroundAOPContext): AOPMethod {
    return (...args: any[]) => {
      trace.push('inner:before');
      const result = proceed(...args);
      trace.push('inner:after');
      return result;
    };
  }
}

// A before advice that throws, to observe how a failing advice affects the call.
@Aspect()
class ThrowingBeforeAspect extends AOPDecorator {
  before() {
    return () => {
      throw new Error('before-failed');
    };
  }
}

@Injectable()
class DemoService {
  @CycleAspect.around()
  @CycleAspect.before()
  @CycleAspect.after()
  @CycleAspect.afterReturning()
  succeed() {
    trace.push('method');
    return 'value';
  }

  @CycleAspect.around()
  @CycleAspect.before()
  @CycleAspect.after()
  @CycleAspect.afterThrowing()
  fail() {
    trace.push('method');
    throw new Error('boom');
  }

  @TransformAspect.around()
  identity(n: number) {
    return n;
  }

  ran = false;

  @GuardAspect.around({ skip: true })
  blocked() {
    this.ran = true;
    return 'real';
  }

  @OuterAspect.around()
  @InnerAspect.around()
  nested() {
    trace.push('method');
    return 'nested';
  }

  beforeThrewRan = false;

  @ThrowingBeforeAspect.before()
  fragile() {
    this.beforeThrewRan = true;
    return 'done';
  }
}

@Module({
  imports: [AOPModule],
  providers: [
    DemoService,
    CycleAspect,
    TransformAspect,
    GuardAspect,
    OuterAspect,
    InnerAspect,
    ThrowingBeforeAspect,
  ],
})
class DemoModule {}

describe('AOP advice lifecycle (e2e test)', () => {
  let app: TestingModule;
  let service: DemoService;

  beforeEach(async () => {
    trace.length = 0;
    app = await Test.createTestingModule({ imports: [DemoModule] }).compile();
    await app.init();
    service = app.get(DemoService);
  });

  afterEach(async () => {
    await app?.close();
  });

  it('runs the full advice cycle in Spring order on success', () => {
    const result = service.succeed();

    expect(result).toBe('value');
    expect(trace).toEqual([
      'around:before',
      'before',
      'method',
      'afterReturning:value',
      'after',
      'around:after',
    ]);
  });

  it('runs afterThrowing (not afterReturning) when the method throws', () => {
    expect(() => service.fail()).toThrow('boom');

    // around:after is never reached because proceed() rethrows.
    expect(trace).toEqual(['around:before', 'before', 'method', 'afterThrowing:boom', 'after']);
  });

  it('lets around rewrite both the arguments and the return value', () => {
    // identity(5): args doubled to 10, method returns 10, around adds 100 => 110
    expect(service.identity(5)).toBe(110);
  });

  it('lets around short-circuit the method entirely', () => {
    expect(service.blocked()).toBe('short-circuited');
    expect(service.ran).toBe(false);
  });

  it('nests multiple around advices by ascending order (lower order outermost)', () => {
    const result = service.nested();

    expect(result).toBe('nested');
    expect(trace).toEqual(['outer:before', 'inner:before', 'method', 'inner:after', 'outer:after']);
  });

  it('propagates a throwing before-advice and skips the method', () => {
    expect(() => service.fragile()).toThrow('before-failed');
    expect(service.beforeThrewRan).toBe(false);
  });
});
