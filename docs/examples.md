# SAOP 사용 예제

이 문서에서는 SAOP 라이브러리의 다양한 사용 예제를 제공합니다.

## 목차

1. [기본 설정](#기본-설정)
2. [로깅 데코레이터](#로깅-데코레이터)
3. [캐싱 데코레이터](#캐싱-데코레이터)
4. [성능 모니터링 데코레이터](#성능-모니터링-데코레이터)
5. [트랜잭션 데코레이터](#트랜잭션-데코레이터)
6. [인증/인가 데코레이터](#인증인가-데코레이터)
7. [다중 데코레이터](#다중-데코레이터)
8. [옵션 활용](#옵션-활용)

## 기본 설정

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

### 2. 간단한 서비스 (클래스 기반 데코레이터 - Nest.js UseInterceptor() 스타일)

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common';
import { LoggingDecorator, CachingDecorator, PerformanceDecorator } from 'nestjs-saop';

@Injectable()
export class UserService {
  @LoggingDecorator.create({ level: 'info', logArgs: true })
  async createUser(userData: any) {
    console.log('사용자 생성 로직 실행');
    return { id: 1, ...userData };
  }

  @LoggingDecorator.create({ level: 'debug', logResult: true })
  async updateUser(id: string, userData: any) {
    console.log('사용자 업데이트 로직 실행');
    return { id, ...userData };
  }

  @CachingDecorator.create({ ttl: 300000 }) // 5분 캐시
  async getUserById(id: string) {
    console.log('사용자 조회 로직 실행');
    return { id, name: 'John Doe' };
  }

  @PerformanceDecorator.create({ logPerformance: true, threshold: 1000 })
  async getAllUsers() {
    console.log('전체 사용자 조회 로직 실행');
    return [{ id: 1, name: 'John' }];
  }
}
```

### 3. 간단한 서비스 (함수 기반 데코레이터 - 대안)

```typescript
// user.service.ts (alternative)
import { Injectable } from '@nestjs/common';
import { LoggingDecoratorFn, CachingDecoratorFn, PerformanceDecoratorFn } from 'nestjs-saop';

@Injectable()
export class UserService {
  @LoggingDecoratorFn({ level: 'info', logArgs: true })
  async createUser(userData: any) {
    console.log('사용자 생성 로직 실행');
    return { id: 1, ...userData };
  }

  @LoggingDecoratorFn({ level: 'debug', logResult: true })
  async updateUser(id: string, userData: any) {
    console.log('사용자 업데이트 로직 실행');
    return { id, ...userData };
  }
}
```

### 3. 간단한 서비스 (함수 기반 데코레이터 - 기존 방식)

```typescript
// user.service.ts (legacy)
import { Injectable } from '@nestjs/common';
import { Before, After } from 'nestjs-saop';

@Injectable()
export class UserService {
  @Before()
  async createUser(userData: any) {
    console.log('사용자 생성 시작');
    return { id: 1, ...userData };
  }

  @After()
  async updateUser(id: string, userData: any) {
    console.log('사용자 업데이트 완료');
    return { id, ...userData };
  }
}
```

## 로깅 데코레이터

### 구현

```typescript
// logging.decorator.ts
import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from 'nestjs-saop';

@Injectable()
export class LoggingDecorator extends SAOPDecorator {
  before(context: any) {
    return (...args: any[]) => {
      console.log(`[${new Date().toISOString()}] 📍 ${context.method.name} 시작`, {
        args: args.length > 0 ? args : undefined,
        options: context.options,
      });
    };
  }

  after(context: any) {
    return (...args: any[]) => {
      console.log(`[${new Date().toISOString()}] ✅ ${context.method.name} 완료`);
    };
  }

  afterReturning(context: any) {
    return (...args: any[]) => {
      if (context.options.logResult) {
        console.log(`[${new Date().toISOString()}] 📦 ${context.method.name} 결과:`, context.result);
      }
    };
  }

  afterThrowing(context: any) {
    return (...args: any[]) => {
      console.error(`[${new Date().toISOString()}] ❌ ${context.method.name} 에러:`, {
        error: context.error.message,
        stack: context.error.stack,
      });
    };
  }
}
```

### 사용

```typescript
// app.module.ts
import { LoggingDecorator } from './decorators/logging.decorator';

@Module({
  imports: [SAOPModule.forRoot()],
  providers: [LoggingDecorator],
})
export class AppModule {}
```

```typescript
// user.service.ts
@Before({ logLevel: 'info' })
@AfterReturning({ logResult: true })
@AfterThrowing()
async createUser(userData: any) {
  if (!userData.email) {
    throw new Error('Email is required');
  }
  return { id: 1, ...userData };
}
```

## 캐싱 데코레이터

### 구현

```typescript
// cache.decorator.ts
import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from 'nestjs-saop';

@Injectable()
export class CacheDecorator extends SAOPDecorator {
  private cache = new Map<string, { value: any; expiry: number }>();

  around(context: any) {
    return async (...args: any[]) => {
      const key = this.generateKey(context.method.name, args);
      const ttl = context.options.ttl || 300000; // 5분 기본

      // 캐시된 값 확인
      const cached = this.cache.get(key);
      if (cached && cached.expiry > Date.now()) {
        console.log('🔄 Cache hit:', key);
        return cached.value;
      }

      // 캐시 만료 또는 없음
      console.log('📭 Cache miss:', key);
      const result = await context.method.apply(this, args);

      // 결과 캐싱
      this.cache.set(key, {
        value: result,
        expiry: Date.now() + ttl,
      });

      return result;
    };
  }

  private generateKey(methodName: string, args: any[]): string {
    return `${methodName}:${JSON.stringify(args)}`;
  }

  // 캐시 정리 메소드
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }
}
```

### 사용

```typescript
// user.service.ts
@Around({ ttl: 600000 }) // 10분 캐시
async getUserById(id: string) {
  // DB 조회 (실제로는 시간이 많이 걸리는 작업)
  await new Promise(resolve => setTimeout(resolve, 100));
  return { id, name: 'John Doe', email: 'john@example.com' };
}

@Around({ ttl: 300000 }) // 5분 캐시
async getUsersByRole(role: string) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [
    { id: 1, name: 'John', role },
    { id: 2, name: 'Jane', role },
  ];
}
```

## 성능 모니터링 데코레이터

### 구현

```typescript
// performance.decorator.ts
import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from 'nestjs-saop';

@Injectable()
export class PerformanceDecorator extends SAOPDecorator {
  private metrics = new Map<string, number[]>();

  around(context: any) {
    return async (...args: any[]) => {
      const startTime = Date.now();
      const methodName = context.method.name;

      try {
        const result = await context.method.apply(this, args);
        const duration = Date.now() - startTime;

        this.recordMetric(methodName, duration);

        if (context.options.logPerformance) {
          console.log(`⏱️ ${methodName} took ${duration}ms`);
        }

        // 성능 임계값 체크
        if (context.options.slowThreshold && duration > context.options.slowThreshold) {
          console.warn(`🐌 ${methodName} is slow: ${duration}ms > ${context.options.slowThreshold}ms`);
        }

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`💥 ${methodName} failed after ${duration}ms:`, error);
        throw error;
      }
    };
  }

  private recordMetric(methodName: string, duration: number) {
    if (!this.metrics.has(methodName)) {
      this.metrics.set(methodName, []);
    }

    const metrics = this.metrics.get(methodName)!;
    metrics.push(duration);

    // 최근 100개만 유지
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  getMetrics(methodName?: string) {
    if (methodName) {
      const metrics = this.metrics.get(methodName) || [];
      const avg = metrics.reduce((a, b) => a + b, 0) / metrics.length;
      const max = Math.max(...metrics);
      const min = Math.min(...metrics);

      return { count: metrics.length, avg, max, min };
    }

    const result: Record<string, any> = {};
    for (const [name, metrics] of this.metrics.entries()) {
      result[name] = {
        count: metrics.length,
        avg: metrics.reduce((a, b) => a + b, 0) / metrics.length,
        max: Math.max(...metrics),
        min: Math.min(...metrics),
      };
    }

    return result;
  }
}
```

### 사용

```typescript
// user.service.ts
@Around({ logPerformance: true, slowThreshold: 1000 })
async getUsers() {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [{ id: 1, name: 'John' }];
}

@Around({ logPerformance: true, slowThreshold: 2000 })
async processUserData(data: any) {
  // 복잡한 데이터 처리
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { processed: true, data };
}
```

## 트랜잭션 데코레이터

### 구현

```typescript
// transaction.decorator.ts
import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from 'nestjs-saop';

@Injectable()
export class TransactionDecorator extends SAOPDecorator {
  around(context: any) {
    return async (...args: any[]) => {
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(`🔄 Starting transaction: ${transactionId}`);

      try {
        // 트랜잭션 시작 로직
        const result = await context.method.apply(this, args);

        // 트랜잭션 커밋 로직
        console.log(`✅ Committing transaction: ${transactionId}`);

        return result;
      } catch (error) {
        // 트랜잭션 롤백 로직
        console.error(`❌ Rolling back transaction: ${transactionId}`, error);

        throw error;
      }
    };
  }
}
```

### 사용

```typescript
// user.service.ts
@Around()
async createUserWithProfile(userData: any, profileData: any) {
  // 사용자 생성
  const user = await this.userRepository.create(userData);

  // 프로필 생성 (실패하면 사용자도 롤백되어야 함)
  const profile = await this.profileRepository.create({
    userId: user.id,
    ...profileData,
  });

  return { user, profile };
}
```

## 인증/인가 데코레이터

### 구현

```typescript
// auth.decorator.ts
import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from 'nestjs-saop';

@Injectable()
export class AuthDecorator extends SAOPDecorator {
  before(context: any) {
    return (...args: any[]) => {
      // 간단한 인증 로직 (실제로는 JWT 검증 등)
      const token = this.extractTokenFromArgs(args);

      if (!token) {
        throw new Error('Authentication required');
      }

      if (!this.isValidToken(token)) {
        throw new Error('Invalid token');
      }

      // 권한 체크
      const user = this.getUserFromToken(token);
      const requiredRoles = context.options.roles || [];

      if (requiredRoles.length > 0) {
        const hasRole = requiredRoles.some((role: string) => user.roles.includes(role));
        if (!hasRole) {
          throw new Error(`Required roles: ${requiredRoles.join(', ')}`);
        }
      }

      console.log(`🔐 Authenticated user: ${user.id}`);
    };
  }

  private extractTokenFromArgs(args: any[]): string | null {
    // 첫 번째 인자가 토큰이라고 가정 (실제로는 헤더나 다른 곳에서 추출)
    return args[0]?.token || null;
  }

  private isValidToken(token: string): boolean {
    // 간단한 토큰 검증 (실제로는 JWT 검증)
    return token && token.startsWith('valid_');
  }

  private getUserFromToken(token: string) {
    // 간단한 사용자 정보 추출 (실제로는 JWT 디코딩)
    return {
      id: 'user123',
      roles: ['user', 'admin'],
    };
  }
}
```

### 사용

```typescript
// user.service.ts
@Before({ roles: ['admin'] })
async deleteUser(token: string, userId: string) {
  return this.userRepository.delete(userId);
}

@Before({ roles: ['user'] })
async updateProfile(token: string, profileData: any) {
  const user = this.authService.getUserFromToken(token);
  return this.userRepository.update(user.id, profileData);
}
```

## 다중 데코레이터

### 여러 데코레이터 조합

```typescript
// user.service.ts
@Before({ logLevel: 'info' })
@Around({ ttl: 300000 }) // 캐싱
@AfterReturning({ logResult: true })
@AfterThrowing()
async getUserWithCaching(token: string, userId: string) {
  // 인증 → 캐싱 → 로깅 순으로 실행
  return this.userRepository.findById(userId);
}
```

### 데코레이터 우선순위

```typescript
// user.service.ts
@Before({ priority: 1 }) // 먼저 실행
@Before({ priority: 2 }) // 나중에 실행
async complexOperation() {
  // priority가 낮은 순서대로 실행됨
}
```

## 고급 데코레이터 기능

### 특정 데코레이터 클래스 지정

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from 'nestjs-saop';

@Injectable()
export class UserService {
  // 특정 데코레이터 클래스만 적용
  @SAOPDecorator.create({
    type: 'before',
    decoratorClass: 'LoggingDecorator',
    options: { level: 'info' }
  })
  async createUser(userData: any) {
    return { id: 1, ...userData };
  }

  // 여러 데코레이터 클래스 지정
  @SAOPDecorator.create({
    type: 'around',
    decoratorClass: 'CachingDecorator',
    options: { ttl: 300000 }
  })
  @SAOPDecorator.create({
    type: 'before',
    decoratorClass: 'AuthDecorator',
    options: { roles: ['admin'] }
  })
  async getAdminData() {
    return { sensitive: 'admin data' };
  }
}
```

### 메타데이터 기반 데코레이터

```typescript
// custom-decorator.service.ts
import { Injectable } from '@nestjs/common';
import { SAOPDecorator, SAOP_METADATA_KEY } from 'nestjs-saop';

@Injectable()
export class CustomDecoratorService {
  // 메타데이터를 활용한 동적 데코레이터 적용
  applyDecoratorsBasedOnMetadata(target: any, methodName: string) {
    const metadata = Reflect.getMetadata(SAOP_METADATA_KEY, target.constructor, methodName);
    
    if (metadata) {
      console.log('적용된 데코레이터들:', metadata);
      // 메타데이터 기반으로 추가 로직 수행
    }
  }
}
```</content>
<parameter name="filePath">c:\Users\mjang\Desktop\projects\nestjs-saop\docs\examples.md
