import { Injectable, Module } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AOPDecorator, AOPModule, Aspect, ErrorAOPContext, ResultAOPContext } from '../../src';

// 어드바이스 실행 순서를 기록하는 트래커
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

describe('비동기 메서드에서의 AOP 어드바이스 타이밍', () => {
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

  it('afterReturning은 Promise가 resolve된 "후"의 실제 값을 받아야 한다', async () => {
    const result = await service.getAsyncValue();
    expect(result).toBe('async-result');

    console.log('[성공 케이스 실행 순서]', trace);

    // 기대: 메서드가 완전히 끝난 뒤 afterReturning이 실제 결과값으로 호출
    const arIndex = trace.findIndex(t => t.startsWith('afterReturning'));
    const methodEndIndex = trace.indexOf('method:end');
    expect(arIndex).toBeGreaterThan(methodEndIndex);
    expect(trace).toContain('afterReturning:result="async-result"');
  });

  it('afterThrowing은 비동기 메서드가 reject될 때 호출되어야 한다', async () => {
    await expect(service.throwAsync()).rejects.toThrow('async error');

    console.log('[에러 케이스 실행 순서]', trace);

    expect(trace.some(t => t.startsWith('afterThrowing'))).toBe(true);
  });
});
