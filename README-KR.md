# nestjs-saop

[![npm version](https://img.shields.io/npm/v/nestjs-saop.svg)](https://www.npmjs.com/package/nestjs-saop)
[![codecov](https://codecov.io/github/miinhho/nestjs-saop/graph/badge.svg?token=XXUGSS0MWV)](https://codecov.io/github/miinhho/nestjs-saop)
![Github Workflow](https://github.com/miinhho/nestjs-saop/actions/workflows/ci.yml/badge.svg?branch=main)
[![package license](https://img.shields.io/npm/l/nestjs-saop.svg)](https://www.npmjs.com/package/nestjs-saop)

[English](https://github.com/miinhho/nestjs-saop/blob/main/README-KR.md) | 한국어

Nest.js 에서의 Spring 스타일 AOP (Aspect Oriented Programming)

## Features

- ✅ **완벽한 AOP Advice Type 지원**: Spring 스타일의 5가지 AOP 어드바이스 타입 모두 지원
  - **Around**: 메서드 실행 전, 중, 후에 완벽한 제어
  - **Before**: 메서드 호출 전 실행
  - **After**: 메서드 완료 후 (성공/실패 관계없이) 실행
  - **AfterReturning**: 메서드가 성공적으로 완료된 경우에만 실행
  - **AfterThrowing**: 메서드가 예외를 던진 경우에만 실행

- ✅ **완벽한 TypeScript 지원**: 제네릭과 인터페이스를 사용하여 강력한 타입 지원
  - 강력하게 타입이 지정된 AOP 컨텍스트 및 옵션
  - 메서드 반환 타입과 에러 타입에 대한 제네릭 지원
  - 모든 AOP 작업에 대한 IntelliSense 지원

- ✅ **NestJS 통합**: NestJS 모듈 시스템과의 원활한 통합
  - 글로벌 AOP 구성을 위한 `AOPModule.forRoot()`
  - NestJS DiscoveryModule을 사용한 자동 인스턴스 검색
  - 모든 NestJS 의존성 주입 패턴과 호환

- ✅ **유연한 구성**: 매우 설정 가능한 AOP 옵션 및 컨텍스트
  - 런타임 조건에 따른 AOP 실행 조건 부여
  - 서로 다른 구성의 다중 메서드 데코레이터 지원

- ✅ **데코레이터 패턴 구현**: 깔끔한 데코레이터 기반 API
  - 선택적 실행 순서 제어가 가능한 AOP 클래스 `@Aspect({ order?: number })` 데코레이터
  - 손쉬운 적용을 위한 정적 메서드 데코레이터

## Installation

```bash
npm install nestjs-saop
# 또는
yarn add nestjs-saop
# 또는
pnpm add nestjs-saop
```

## Quick Start

### 1. Import AOPModule

```ts
import { AOPModule } from 'nestjs-saop';

@Module({
  imports: [
    // ... 기타 모듈들
    AOPModule.forRoot(),
  ],
})
export class AppModule {}
```

### 2. AOP 데코레이터 생성

```ts
import { AOPDecorator, Aspect } from 'nestjs-saop';

@Aspect()
export class LoggingDecorator extends AOPDecorator {
  around({ method, proceed, options }) {
    return (...args: any[]) => {
      console.log('🔄 Around: 메서드 호출 전', ...args);
      const result = proceed(...args);
      console.log('🔄 Around: 메서드 호출 후', result);
      return result;
    };
  }

  before({ method, options }) {
    return (...args: any[]) => {
      console.log('▶️ Before: 메서드가 호출됨', ...args);
    };
  }

  after({ method, options }) {
    return (...args: any[]) => {
      console.log('⏹️ After: 메서드 실행 완료');
    };
  }

  afterReturning({ method, options, result }) {
    return (...args: any[]) => {
      console.log('✅ AfterReturning: 메서드 반환 값', result);
    };
  }

  afterThrowing({ method, options, error }): (...args: any[]) => void {
    return (...args: any[]) => {
      console.log('❌ AfterThrowing: 메서드 예외 발생', error.message);
    };
  }
}
```

### 3. 모듈에 데코레이터 등록

```ts
import { LoggingDecorator } from './logging.decorator';

@Module({
  providers: [LoggingDecorator],
})
export class AppModule {}
```

### 4. AOP 데코레이터 사용

```ts
import { LoggingDecorator, CachingDecorator, PerformanceDecorator } from 'example-path';

@Injectable()
export class ExampleService {
  @LoggingDecorator.after({ level: 'info', logArgs: true, logResult: true })
  processData(data: any): string {
    return `Processed: ${data}`;
  }

  @CachingDecorator.afterReturn({ ttl: 300000 }) 
  async getUserById(id: string): Promise<User> {
    return await this.userRepository.findById(id);
  }

  @PerformanceDecorator.around({ logPerformance: true, threshold: 1000 })
  async expensiveOperation(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { result: 'done' };
  }
}
```

## 사용 가이드

### AOP 실행 순서

1. `🔄 Around`
2. `▶️ Before`
3. `✅ AfterReturning` 또는 `❌ AfterThrowing`
4. `⏹️ After`
5. `🔄 Around`

### AOP 실행 순서 제어

여러 AOP 데코레이터가 동일한 메서드에 적용된 경우, `@Aspect()` 데코레이터의 `order` 옵션을 사용하여 실행 순서를 제어할 수 있습니다. 숫자가 낮을수록 먼저 실행됩니다. 순서가 지정되지 않은 경우 기본값은 `Number.MAX_SAFE_INTEGER`로 가장 낮은 우선순위를 갖게 됩니다.

```ts
import { AOPDecorator, Aspect } from 'nestjs-saop';

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
    return 'AOP 실행 순서가 적용됨';
  }
}
```

이 예제에서 `getOrdered()` 메서드가 호출되면 AOP는 'First'(순서 1), 'Second'(순서 2), 'Third'(순서 3)의 순서대로 실행됩니다.

### AOP Advice Types

#### Around 
**사용 사례**: 캐싱, 성능 모니터링 또는 트랜잭션 관리와 같이 메서드 실행 전후에 완벽한 제어가 필요한 경우

```ts
@Aspect()
export class CachingDecorator extends AOPDecorator {
  private cache = new Map();

  around({ method, options, proceed }) {
    return (...args: any[]) => {
      const key = `${method.name}:${JSON.stringify(args)}`;

      if (this.cache.has(key)) {
        console.log('🔄 캐시 히트!');
        return this.cache.get(key);
      }

      console.log('🔄 캐시 미스, 메서드 실행...');
      const result = proceed(...args);

      if (options.ttl) {
        setTimeout(() => this.cache.delete(key), options.ttl);
      }

      this.cache.set(key, result);
      return result;
    };
  }
}

// 사용 예제
@Injectable()
export class UserService {
  @CachingDecorator.around({ ttl: 300000 })
  async getUserById(id: string): Promise<User> {
    return await this.userRepository.findById(id);
  }
}
```

#### Before
**사용 사례**: 메서드 호출 로그 기록, 검증, 인증 검사 등

```ts
@Aspect()
export class LoggingDecorator extends AOPDecorator {
  before({ method, options }) {
    return (...args: any[]) => {
      console.log(`▶️ [${new Date().toISOString()}] ${method.name} 호출:`, args);
    };
  }
}

// 사용 예제
@Injectable()
export class PaymentService {
  @LoggingDecorator.before({ level: 'info' })
  async processPayment(amount: number, userId: string): Promise<PaymentResult> {
    return { success: true, transactionId: 'tx_123' };
  }
}
```

#### After
**사용 사례**: 자원 정리, 리소스 관리 등 메서드 실행 성공 여부와 관계없이 실행이 필요할 때

```ts
@Aspect()
export class ResourceCleanupDecorator extends AOPDecorator {
  after({ method, options }) {
    return (...args: any[]) => {
      console.log('🧹 메서드 실행 후 리소스 정리');
      // 정리 작업 수행
    };
  }
}

// 사용 예제
@Injectable()
export class FileService {
  @ResourceCleanupDecorator.after()
  async processFile(filePath: string): Promise<void> {
    const fileHandle = await fs.open(filePath, 'r');
    try {
      await this.processFileContent(fileHandle);
    } finally {
      await fileHandle.close();
    }
  }
}
```

#### AfterReturning
**사용 사례**: 성공적으로 완료된 결과 후 처리, 응답 형식 변환, 메트릭 수집 등

```ts
@Aspect()
export class ResponseFormatterDecorator extends AOPDecorator {
  afterReturning({ method, options, result }) {
    return (...args: any[]) => {
      console.log('✅ 메서드가 성공적으로 완료됨');
      if (options.format === 'json') {
        return {
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        };
      }
      return result;
    };
  }
}

// 사용 예제
@Injectable()
export class ApiService {
  @ResponseFormatterDecorator.afterReturning({ format: 'json' })
  async getUserData(userId: string): Promise<UserData> {
    return await this.userRepository.findById(userId);
  }
}
```

#### AfterThrowing
**사용 사례**: 에러 로그 기록, 에러 복구, 대체 동작 구현 등.

```ts
@Aspect()
export class ErrorHandlingDecorator extends AOPDecorator {
  constructor(private readonly errorLogger: ErrorLogger) {}

  afterThrowing({ method, options, error }) {
    return (...args: any[]) => {
      console.error(`❌ ${method.name} 메서드 실패:`, error.message);

      if (options.retry && options.retryCount < 3) {
        console.log(`🔄 재시도... (${options.retryCount + 1}/3)`);
        // 재시도 로직 구현
      }

      // 외부 서비스에 로그 전송
      this.errorLogger.log({
        method: method.name,
        error: error.message,
        timestamp: new Date().toISOString(),
        args: options.logArgs ? args : undefined
      });
    };
  }
}

// 사용 예제
@Injectable()
export class ExternalApiService {
  @ErrorHandlingDecorator.afterThrowing({ retry: true, retryCount: 0, logArgs: true })
  async callExternalAPI(endpoint: string): Promise<ExternalData> {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }
    return response.json();
  }
}
```

### 제네릭을 활용한 AOPDecorator

`AOPDecorator` 클래스는 제네릭을 사용하여 강력한 타입 안전성과 더 나은 IntelliSense 지원을 제공합니다.

```ts
// 기본 제네릭 사용법
@Aspect()
export class BasicDecorator extends AOPDecorator {
  // 기본 옵션 타입: AOPOptions 사용
}

// 사용자 정의 옵션 타입 사용법
interface LoggingOptions {
  level: 'debug' | 'info' | 'warn' | 'error';
  includeTimestamp: boolean;
}

@Aspect()
export class LoggingDecorator extends AOPDecorator {
  // 사용자 정의 옵션에 해당하는 제네릭 타입 파라미터
  // LoggingDecorator.before() 를 사용했을 때 타입스크립트가 자동으로 옵션 타입을 추론할 수 있도록 해줍니다
  before({ method, options }: UnitAOPContext<LoggingOptions>) {
    return (...args: any[]) => {
      const timestamp = options.includeTimestamp ? `[${new Date().toISOString()}] ` : '';
      console.log(`${timestamp}${options.level.toUpperCase()}: ${method.name} 호출됨`);
    };
  }
}

// 반환 타입 및 에러 타입 사용 예제
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

@Aspect()
export class ApiDecorator extends AOPDecorator {
  // `AOPOptions` 는 기본 옵션 타입입니다
  afterReturning({ method, options, result }: ResultAOPContext<AOPOptions, ApiResponse<any>>) {
    return (...args: any[]) => {
      console.log(`✅ API 호출 성공: ${method.name}`);
      // 이 때 result 는 ApiResponse<any> 타입입니다
      if (result.success) {
        console.log(`📊 응답 데이터:`, result.data);
      }
    };
  }

  afterThrowing({ method, options, error }: ErrorAOPContext<AOPOptions, Error>) {
    return (...args: any[]) => {
      console.error(`❌ API 호출 실패: ${method.name}`, error.message);
    };
  }
}

// 타입이 지정된 데코레이터 사용법
@Injectable()
export class UserService {
  @LoggingDecorator.before({
    level: 'info',
    includeTimestamp: true
  })
  async getUser(id: string): Promise<User> {
    // 메서드 구현
  }

  @ApiDecorator.afterReturning()
  async getUserData(id: string): Promise<ApiResponse<User>> {
    // 메서드 구현
  }
}
```

**제네릭 사용의 장점:**

1. **타입 안전성**: 컴파일 단계에서 타입 오류를 잡아낼 수 있습니다.
2. **향상된 IntelliSense**: IDE가 정확한 자동 완성을 제공합니다.
3. **자체 문서화**: 타입 자체가 문서 역할을 합니다.

**Advice Type 별 컨텍스트 타입:**

```ts
// Before, After 어드바이스
UnitAOPContext<Options> = {
  method: Function;
  options: Options;
}

// AfterReturning 어드바이스
ResultAOPContext<Options, ReturnType> = {
  method: Function;
  options: Options;
  result: ReturnType;  // afterReturning에서만 사용 가능
}

// Around 어드바이스
AroundAOPContext<Options> = {
  method: Function;
  instance: object;
  proceed: Function;
  options: Options;
};

// AfterThrowing 어드바이스
ErrorAOPContext<Options, ErrorType> = {
  method: Function;
  options: Options;
  error: ErrorType;   // afterThrowing에서만 사용 가능
}
```

#### 단일 메서드에 여러 데코레이터 적용

```ts
@Injectable()
export class ComplexService {
  @LoggingDecorator.before({ level: 'info', logArgs: true })
  @PerformanceDecorator.around({ threshold: 1000, logPerformance: true })
  @CachingDecorator.around({ ttl: 300000 })
  @ErrorHandlingDecorator.afterThrowing({ retry: true, logArgs: true })
  async complexOperation(data: ComplexData): Promise<ComplexResult> {
    // 아래 작업이 AOP 데코레이터에 의해 수행됩니다:
    // 1. 성능 모니터링
    // 2. 호출 전 로깅
    // 3. 에러 처리
    // 4. 캐싱
    return await this.processComplexData(data);
  }
}
```

#### 클래스 레벨 AOP 데코레이터

클래스 레벨에서 AOP 데코레이터를 적용하면, 해당 클래스의 모든 공개 메서드에 해당 데코레이터가 적용됩니다.

> [!WARNING]
> 클래스 레벨 AOP 데코레이터는 비공개 메서드, getter, setter, 정적 메서드, 화살표 함수에는 적용되지 않습니다.
> 상속된 클래스라면, 부모 클래스로부터 상속된 메서드에도 적용되지 않습니다. 이것은 의도된 동작입니다.

```ts
@Injectable()
@LoggingDecorator.around()
class HelloService {
  getHello(name: string) {
    return `Hello ${name}!`;
  }
}
```

#### Importing AOPModule 

`AOPModule.forRoot` 는 `AOPModule` 을 전역 모듈로 설정합니다. 하지만 필요에 따라 특정 모듈에서만 `AOPModule` 를 등록할 수도 있습니다.
```ts
@Module({
  imports: [AOPModule],
})
export class SpecificModule {}
```

### AOP 데코레이터 테스트

NestJS의 TestingModule을 사용하여 테스트할 때, AOP 시스템이 올바르게 초기화되도록 `init()` 메서드를 호출해야 합니다.

```ts
describe('AOP 통합 (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AOPModule.forRoot()],
      providers: [LoggingDecorator, TestService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init(); // AOP 초기화를 위해 필요
  });

  it('서비스 메서드에 AOP 어드바이스가 적용되어야 함', () => {
    const testService = app.get(TestService);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const result = testService.testMethod('test');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Before: Method called')
    );
    expect(result).toBe('processed: test');
  });
});
```

## 기여

기여를 환영합니다! 자세한 내용은 [기여 가이드](CONTRIBUTING.md)를 참고하세요.
