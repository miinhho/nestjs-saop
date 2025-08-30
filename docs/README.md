# SAOP (Spring-like Aspect Oriented Programming) for NestJS

## 개요

SAOP는 NestJS 애플리케이션에서 **관점 지향 프로그래밍(Aspect Oriented Programming)**을 구현하는 라이브러리입니다. Spring Framework의 AOP와 유사한 기능을 제공하여 코드의 모듈성과 재사용성을 향상시킵니다.

## 주요 특징

- 🎯 **간단한 사용법**: 데코레이터 기반의 직관적인 API
- 🔧 **유연한 설정**: 다양한 옵션으로 세부적인 제어 가능
- 🚀 **고성능**: 런타임 오버헤드 최소화
- 📦 **NestJS 통합**: DiscoveryModule을 활용한 자동 탐색
- 🛡️ **타입 안전**: TypeScript 완전 지원
- 🧪 **높은 테스트 커버리지**: 100% statements, 95.18% branches, 100% functions

## 설치

```bash
npm install nestjs-saop
# 또는
yarn add nestjs-saop
# 또는
pnpm add nestjs-saop
```

## 빠른 시작

### 1. 모듈 설정

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { SAOPModule } from 'nestjs-saop';

@Module({
  imports: [
    SAOPModule.forRoot(),
    // 다른 모듈들...
  ],
})
export class AppModule {}
```

### 2. 데코레이터 사용 (클래스 기반)

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from 'nestjs-saop';

@Injectable()
export class UserService {
  @SAOPDecorator.create({ type: 'before', options: { logLevel: 'info' } })
  async createUser(userData: CreateUserDto): Promise<User> {
    // 메소드 실행 전에 로깅
    return this.userRepository.create(userData);
  }

  @SAOPDecorator.create({ type: 'afterReturning', options: { logResult: true } })
  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    // 메소드 실행 후 결과 로깅
    return this.userRepository.update(id, userData);
  }

  @SAOPDecorator.create({ type: 'around', options: { cache: true } })
  async getUser(id: string): Promise<User> {
    // 메소드 실행을 완전히 제어 (캐싱 등)
    return this.userRepository.findById(id);
  }
}
```

### 3. SAOP 데코레이터 구현

```typescript
// logging.decorator.ts
import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from 'nestjs-saop';

@Injectable()
export class LoggingDecorator extends SAOPDecorator {
  before(context: any) {
    return (...args: any[]) => {
      console.log(`[${new Date().toISOString()}] ${context.method.name} 시작`, {
        args,
        options: context.options,
      });
    };
  }

  after(context: any) {
    return (...args: any[]) => {
      console.log(`[${new Date().toISOString()}] ${context.method.name} 완료`);
    };
  }

  afterThrowing(context: any) {
    return (...args: any[]) => {
      console.error(`[${new Date().toISOString()}] ${context.method.name} 에러 발생:`, {
        error: context.error,
        args,
      });
    };
  }
}
```

### 4. 데코레이터 등록

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { SAOPModule } from 'nestjs-saop';
import { LoggingDecorator } from './decorators/logging.decorator';

@Module({
  imports: [SAOPModule.forRoot()],
  providers: [LoggingDecorator],
})
export class AppModule {}
```

## 데코레이터 타입

### @Before
메소드 실행 **전에** 실행되는 데코레이터입니다.

```typescript
@Before({ priority: 1 })
async myMethod() {
  // 이 코드는 myMethod 실행 전에 실행됩니다
}
```

### @After
메소드 실행 **후에** 실행되는 데코레이터입니다. (성공/실패 상관없이)

```typescript
@After()
async myMethod() {
  // 이 코드는 myMethod 실행 후에 실행됩니다
}
```

### @AfterReturning
메소드가 **정상적으로 반환**된 후에 실행되는 데코레이터입니다.

```typescript
@AfterReturning({ logResult: true })
async myMethod(): Promise<string> {
  // 이 코드는 myMethod가 성공적으로 완료된 후에 실행됩니다
  return 'success';
}
```

### @AfterThrowing
메소드 실행 중 **에러가 발생**했을 때 실행되는 데코레이터입니다.

```typescript
@AfterThrowing({ alert: true })
async myMethod() {
  // 이 코드는 myMethod에서 에러가 발생했을 때 실행됩니다
  throw new Error('Something went wrong');
}
```

### @Around
메소드 실행을 **완전히 감싸는** 데코레이터입니다. 가장 강력한 제어권을 가집니다.

```typescript
@Around({ cache: true, timeout: 5000 })
async myMethod() {
  // 이 코드는 myMethod의 실행을 완전히 제어합니다
  // 캐싱, 타임아웃, 재시도 등의 로직을 구현할 수 있습니다
}
```

## 고급 사용법

### 옵션 설정

각 데코레이터는 옵션을 통해 세부적인 동작을 제어할 수 있습니다:

```typescript
@Before({
  priority: 1,
  condition: 'user.role === "admin"',
  logLevel: 'debug'
})
async adminMethod() {
  // 관리자 권한이 있는 경우에만 실행
}
```

### 다중 데코레이터

하나의 메소드에 여러 데코레이터를 적용할 수 있습니다:

```typescript
@Before({ step: 1 })
@Before({ step: 2 })
@After()
async complexMethod() {
  // 여러 데코레이터가 순차적으로 실행됩니다
}
```

### 조건부 실행

데코레이터 옵션을 통해 실행 조건을 제어할 수 있습니다:

```typescript
@Around({
  condition: (context) => context.options.enabled !== false
})
async conditionalMethod() {
  // 특정 조건에서만 데코레이터가 적용됩니다
}
```

## API 레퍼런스

자세한 API 문서는 [API 문서](./api.md)를 참조하세요.

## 예제 프로젝트

더 자세한 예제는 [examples](../examples/) 폴더를 확인하세요.

## 라이선스

MIT License - 자세한 내용은 [LICENSE](../LICENSE) 파일을 참조하세요.</content>
<parameter name="filePath">c:\Users\mjang\Desktop\projects\nestjs-saop\docs\README.md
