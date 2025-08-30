# SAOP API 레퍼런스

## 클래스 및 인터페이스

### SAOPModule

메인 모듈 클래스입니다.

#### 정적 메소드

##### `forRoot(): DynamicModule`

SAOP 모듈을 글로벌 모듈로 설정합니다.

**반환값**: `DynamicModule`

**예제**:
```typescript
@Module({
  imports: [SAOPModule.forRoot()],
})
export class AppModule {}
```

#### 인스턴스 메소드

##### `onModuleInit(): Promise<void>`

NestJS 모듈 초기화 시 자동으로 호출되어 AOP 시스템을 초기화합니다.

### SAOPDecorator 인터페이스

SAOP 데코레이터를 구현하는 클래스가 가져야 할 인터페이스입니다.

```typescript
interface SAOPDecorator<T = unknown, E = unknown> {
  around?(context: Pick<AOPContext<T, E>, 'method' | 'options'>): AOPMethod<T>;
  before?(context: Pick<AOPContext<T, E>, 'method' | 'options'>): AOPMethod<void>;
  after?(context: Pick<AOPContext<T, E>, 'method' | 'options'>): AOPMethod<void>;
  afterReturning?(context: Pick<AOPContext<T, E>, 'method' | 'options' | 'result'>): AOPMethod<void>;
  afterThrowing?(context: Pick<AOPContext<T, E>, 'method' | 'options' | 'error'>): AOPMethod<void>;
}
```

#### 메소드

##### `around?(context): AOPMethod<T>`

메소드 실행을 완전히 감싸는 데코레이터 메소드입니다.

**매개변수**:
- `context`: 메소드와 옵션 정보를 담은 컨텍스트

**반환값**: 감싸진 메소드 함수

##### `before?(context): AOPMethod<void>`

메소드 실행 전에 실행되는 데코레이터 메소드입니다.

**매개변수**:
- `context`: 메소드와 옵션 정보를 담은 컨텍스트

**반환값**: 실행될 콜백 함수

##### `after?(context): AOPMethod<void>`

메소드 실행 후에 실행되는 데코레이터 메소드입니다.

**매개변수**:
- `context`: 메소드와 옵션 정보를 담은 컨텍스트

**반환값**: 실행될 콜백 함수

##### `afterReturning?(context): AOPMethod<void>`

메소드가 정상적으로 반환된 후에 실행되는 데코레이터 메소드입니다.

**매개변수**:
- `context`: 메소드, 옵션, 결과를 담은 컨텍스트

**반환값**: 실행될 콜백 함수

##### `afterThrowing?(context): AOPMethod<void>`

메소드 실행 중 에러가 발생했을 때 실행되는 데코레이터 메소드입니다.

**매개변수**:
- `context`: 메소드, 옵션, 에러를 담은 컨텍스트

**반환값**: 실행될 콜백 함수

#### 정적 메소드

##### `create(options?): DecoratorFunction`

NestJS의 `UseInterceptor()` 패턴과 유사한 정적 메소드로, 데코레이터 함수를 생성합니다.

**매개변수**:
- `options`: 데코레이터 옵션 (선택사항)

**반환값**: 데코레이터 함수

**예제**:
```typescript
@LoggingDecorator.create({ level: 'info' })
async myMethod() {
  // 메소드에 로깅 데코레이터가 적용됩니다
}
```

## 데코레이터 함수

### @Around

메소드 실행을 완전히 감싸는 데코레이터입니다.

```typescript
@Around(options?: SAOPOptions)
```

**매개변수**:
- `options`: 데코레이터 옵션 (선택사항)

### @Before

메소드 실행 전에 실행되는 데코레이터입니다.

```typescript
@Before(options?: SAOPOptions)
```

**매개변수**:
- `options`: 데코레이터 옵션 (선택사항)

### @After

메소드 실행 후에 실행되는 데코레이터입니다.

```typescript
@After(options?: SAOPOptions)
```

**매개변수**:
- `options`: 데코레이터 옵션 (선택사항)

### @AfterReturning

메소드가 정상적으로 반환된 후에 실행되는 데코레이터입니다.

```typescript
@AfterReturning(options?: SAOPOptions)
```

**매개변수**:
- `options`: 데코레이터 옵션 (선택사항)

### @AfterThrowing

메소드 실행 중 에러가 발생했을 때 실행되는 데코레이터입니다.

```typescript
@AfterThrowing(options?: SAOPOptions)
```

**매개변수**:
- `options`: 데코레이터 옵션 (선택사항)

## 타입 정의

### AOP_TYPES

지원하는 AOP 데코레이터 타입들의 상수 객체입니다.

```typescript
const AOP_TYPES = {
  AROUND: 'around',
  BEFORE: 'before',
  AFTER: 'after',
  AFTER_RETURNING: 'afterReturning',
  AFTER_THROWING: 'afterThrowing',
} as const;
```

### AOPType

AOP_TYPES의 값들을 유니온 타입으로 정의한 타입입니다.

```typescript
type AOPType = (typeof AOP_TYPES)[keyof typeof AOP_TYPES];
```

### AOPMethod<T>

AOP 데코레이터에서 사용되는 메소드의 타입입니다.

```typescript
type AOPMethod<T = unknown> = (...args: any[]) => T;
```

### AOPContext<T, E>

AOP 데코레이터 메소드들에게 전달되는 컨텍스트 정보의 타입입니다.

```typescript
type AOPContext<T = unknown, E = unknown> = {
  method: Function;
  options: SAOPOptions;
  result?: T;
  error?: E;
};
```

### SAOPOptions

데코레이터에 전달되는 옵션들의 타입입니다.

```typescript
interface SAOPOptions {
  [key: string]: any;
}
```

### SAOPDecoratorMetadata

데코레이터의 메타데이터 정보를 담는 인터페이스입니다.

```typescript
interface SAOPDecoratorMetadata {
  type: AOPType;
  options: SAOPOptions;
  decoratorClass?: string; // 특정 데코레이터 클래스를 지정 (선택사항)
}
```

#### 속성

##### `type: AOPType`

데코레이터의 타입을 지정합니다.

##### `options: SAOPOptions`

데코레이터에 전달되는 옵션 객체입니다.

##### `decoratorClass?: string`

특정 데코레이터 클래스의 이름을 지정합니다. 지정하지 않으면 모든 등록된 데코레이터에 적용됩니다.

## 상수

### SAOP_METADATA_KEY

Reflect 메타데이터에서 SAOP 데코레이터 정보를 저장하기 위한 키입니다.

```typescript
const SAOP_METADATA_KEY = 'saop:decorators';
```

## 사용 예제

### 기본적인 데코레이터 구현

```typescript
import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from 'nestjs-saop';

@Injectable()
export class LoggingDecorator implements SAOPDecorator {
  before(context: any) {
    return (...args: any[]) => {
      console.log(`Method ${context.method.name} called with:`, args);
    };
  }

  afterReturning(context: any) {
    return (...args: any[]) => {
      console.log(`Method ${context.method.name} returned:`, context.result);
    };
  }

  afterThrowing(context: any) {
    return (...args: any[]) => {
      console.error(`Method ${context.method.name} threw:`, context.error);
    };
  }
}
```

### Around 데코레이터로 캐싱 구현

```typescript
import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from 'nestjs-saop';

@Injectable()
export class CacheDecorator implements SAOPDecorator {
  private cache = new Map<string, any>();

  around(context: any) {
    return async (...args: any[]) => {
      const key = `${context.method.name}:${JSON.stringify(args)}`;

      if (this.cache.has(key)) {
        console.log('Cache hit!');
        return this.cache.get(key);
      }

      const result = await context.method.apply(this, args);
      this.cache.set(key, result);

      console.log('Cache miss, stored result');
      return result;
    };
  }
}
```

### 옵션을 활용한 조건부 실행

```typescript
import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from 'nestjs-saop';

@Injectable()
export class ConditionalDecorator implements SAOPDecorator {
  before(context: any) {
    return (...args: any[]) => {
      if (context.options.enabled !== false) {
        console.log('Decorator is enabled');
      }
    };
  }
}
```</content>
<parameter name="filePath">c:\Users\mjang\Desktop\projects\nestjs-saop\docs\api.md
