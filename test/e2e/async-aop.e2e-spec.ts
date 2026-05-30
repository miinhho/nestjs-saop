import { Injectable, Module } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AOPDecorator, AOPModule, Aspect, ErrorAOPContext, ResultAOPContext } from '../../src';

// Tracks the execution order of advice
const trace: string[] = [];

@Aspect()
class AsyncAOP extends AOPDecorator {
  afterReturning({ result }: ResultAOPContext) {
    return () => {
      trace.push(`afterReturning:result=${JSON.stringify(result)}`);
    };
  }

  afterThrowing({ error }: ErrorAOPContext<any, Error>) {
    return () => {
      trace.push(`afterThrowing:error=${error?.message}`);
    };
  }

  after() {
    return () => {
      trace.push('after');
    };
  }
}

@Injectable()
class AsyncService {
  @AsyncAOP.afterReturning()
  @AsyncAOP.after()
  async getAsyncValue(): Promise<string> {
    trace.push('method:start');
    await new Promise(resolve => setTimeout(resolve, 20));
    trace.push('method:end');
    return 'async-result';
  }

  @AsyncAOP.afterThrowing()
  @AsyncAOP.after()
  async throwAsync(): Promise<string> {
    trace.push('method:start');
    await new Promise(resolve => setTimeout(resolve, 20));
    throw new Error('async error');
  }
}

@Module({
  imports: [AOPModule],
  providers: [AsyncService, AsyncAOP],
})
class AsyncModule {}

describe('AOP advice timing on async methods', () => {
  let app: TestingModule;
  let service: AsyncService;

  beforeEach(async () => {
    trace.length = 0;
    app = await Test.createTestingModule({ imports: [AsyncModule] }).compile();
    app.enableShutdownHooks();
    await app.init();
    service = app.get(AsyncService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('afterReturning should receive the actual value after the Promise resolves', async () => {
    const result = await service.getAsyncValue();
    expect(result).toBe('async-result');

    console.log('[fulfilled case execution order]', trace);

    // Expectation: afterReturning is called with the actual resolved value
    // only after the method has fully completed
    const arIndex = trace.findIndex(t => t.startsWith('afterReturning'));
    const methodEndIndex = trace.indexOf('method:end');
    expect(arIndex).toBeGreaterThan(methodEndIndex);
    expect(trace).toContain('afterReturning:result="async-result"');
  });

  it('afterThrowing should be called when an async method rejects', async () => {
    await expect(service.throwAsync()).rejects.toThrow('async error');

    console.log('[rejected case execution order]', trace);

    expect(trace.some(t => t.startsWith('afterThrowing'))).toBe(true);
  });
});
