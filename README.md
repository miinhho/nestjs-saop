# nestjs-saop

[![npm version](https://img.shields.io/npm/v/nestjs-saop.svg)](https://www.npmjs.com/package/nestjs-saop)
[![codecov](https://codecov.io/github/miinhho/nestjs-saop/graph/badge.svg?token=XXUGSS0MWV)](https://codecov.io/github/miinhho/nestjs-saop)
![Github Workflow](https://github.com/miinhho/nestjs-saop/actions/workflows/ci.yml/badge.svg?branch=main)
[![package license](https://img.shields.io/npm/l/nestjs-saop.svg)](https://www.npmjs.com/package/nestjs-saop)

Spring style AOP (Aspect Oriented Programming) in Nest.js

## Features

- ✅ **Complete AOP Advice Types**: Support for all 5 Spring-style AOP advice types
  - **Around**: Complete control over method execution (before, during, and after)
  - **Before**: Execute advice before method invocation
  - **After**: Execute advice after method completion (regardless of success/failure)
  - **AfterReturning**: Execute advice only when method completes successfully
  - **AfterThrowing**: Execute advice only when method throws an exception

- ✅ **Full TypeScript Support**: Complete type safety with generics and interfaces
  - Strongly typed AOP contexts and options
  - Generic support for method return types and error types
  - IntelliSense support for all AOP operations

- ✅ **NestJS Integration**: Seamless integration with NestJS module system
  - `AOPModule.forRoot()` for global AOP configuration
  - Automatic instance discovery using NestJS DiscoveryModule
  - Compatible with all NestJS dependency injection patterns

- ✅ **Flexible Configuration**: Highly configurable AOP options and contexts
  - Custom options support through `AOPOptions` interface
  - Conditional AOP execution based on runtime conditions
  - Multiple decorators per method with different configurations

- ✅ **Decorator Pattern Implementation**: Clean decorator-based API
  - `@Aspect()` decorator for AOP class identification
  - Static method decorators for easy application
  - Interface-based AOP decorator contracts

## Installation

```bash
npm install nestjs-saop
# or
yarn add nestjs-saop
# or
pnpm add nestjs-saop
```

## Quick Start

### 1. Import AOPModule

```ts
import { AOPModule } from 'nestjs-saop';

@Module({
  imports: [
    // ... other modules
    AOPModule.forRoot(),
  ],
})
export class AppModule {}
```

### 2. Create AOP Decorator Implementation

```ts
import { AOPDecorator, Aspect } from 'nestjs-saop';

@Aspect()
export class LoggingDecorator extends AOPDecorator {
  around({ method, options }) {
    return (...args: any[]) => {
      console.log('🔄 Around: Before method call', ...args);
      const result = method.apply(this, args);
      console.log('🔄 Around: After method call', result);
      return result;
    };
  }

  before({ method, options }) {
    return (...args: any[]) => {
      console.log('▶️ Before: Method called with', ...args);
    };
  }

  after({ method, options }) {
    return (...args: any[]) => {
      console.log('⏹️ After: Method completed');
    };
  }

  afterReturning({ method, options, result }) {
    return (...args: any[]) => {
      console.log('✅ AfterReturning: Method returned', result);
    };
  }

  afterThrowing({ method, options, error }): (...args: any[]) => void {
    return (...args: any[]) => {
      console.log('❌ AfterThrowing: Method threw', error.message);
    };
  }
}
```

### 3. Register Decorator in Module

```ts
import { LoggingDecorator } from './logging.decorator';

@Module({
  providers: [LoggingDecorator],
})
export class AppModule {}
```

### 4. Use AOP Decorators

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

### Conditional AOP

```ts
@Aspect()
export class ConditionalDecorator implements AOPDecorator {
  around({ method, options }) {
    return (...args: any[]) => {
      if (options.enabled) {
        console.log('AOP enabled for this method');
        return method.apply(this, args);
      }
      return method.apply(this, args);
    };
  }
}
```

## Usage Guide

### AOP execution cycle

1. `🔄 Around`
2. `▶️ Before`
3. `⏹️ After`
4. `✅ AfterReturning` or `❌ AfterThrowing`
5. `🔄 Around`

### AOP Advice Types

#### Around Advice
**Use case**: Complete control over method execution, perfect for caching, performance monitoring, or transaction management.

```ts
@Aspect()
export class CachingDecorator extends AOPDecorator {
  private cache = new Map();

  around({ method, options }) {
    return (...args: any[]) => {
      const key = `${method.name}:${JSON.stringify(args)}`;

      if (this.cache.has(key)) {
        console.log('🔄 Cache hit!');
        return this.cache.get(key);
      }

      console.log('🔄 Cache miss, executing method...');
      const result = method.apply(this, args);

      if (options.ttl) {
        setTimeout(() => this.cache.delete(key), options.ttl);
      }

      this.cache.set(key, result);
      return result;
    };
  }
}

// Usage
@Injectable()
export class UserService {
  @CachingDecorator.around({ ttl: 300000 })
  async getUserById(id: string): Promise<User> {
    return await this.userRepository.findById(id);
  }
}
```

#### Before Advice
**Use case**: Logging method calls, validation, authentication checks.

```ts
@Aspect()
export class LoggingDecorator extends AOPDecorator {
  before({ method, options }) {
    return (...args: any[]) => {
      console.log(`▶️ [${new Date().toISOString()}] ${method.name} called with:`, args);
    };
  }
}

// Usage
@Injectable()
export class PaymentService {
  @LoggingDecorator.before({ level: 'info' })
  async processPayment(amount: number, userId: string): Promise<PaymentResult> {
    return { success: true, transactionId: 'tx_123' };
  }
}
```

#### After Advice
**Use case**: Cleanup operations, resource management, regardless of method success/failure.

```ts
@Aspect()
export class ResourceCleanupDecorator extends AOPDecorator {
  after({ method, options }) {
    return (...args: any[]) => {
      console.log('🧹 Cleaning up resources after method execution');
      // Cleanup logic here
    };
  }
}

// Usage
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

#### AfterReturning Advice
**Use case**: Post-processing successful results, response formatting, metrics collection.

```ts
@Aspect()
export class ResponseFormatterDecorator extends AOPDecorator {
  afterReturning({ method, options, result }) {
    return (...args: any[]) => {
      console.log('✅ Method completed successfully');
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

// Usage
@Injectable()
export class ApiService {
  @ResponseFormatterDecorator.afterReturning({ format: 'json' })
  async getUserData(userId: string): Promise<UserData> {
    return await this.userRepository.findById(userId);
  }
}
```

#### AfterThrowing Advice
**Use case**: Error logging, error recovery, fallback mechanisms.

```ts
@Aspect()
export class ErrorHandlingDecorator extends AOPDecorator {
  constructor(private readonly errorLogger: ErrorLogger) {}

  afterThrowing({ method, options, error }) {
    return (...args: any[]) => {
      console.error(`❌ Method ${method.name} failed:`, error.message);

      if (options.retry && options.retryCount < 3) {
        console.log(`🔄 Retrying... (${options.retryCount + 1}/3)`);
        // Implement retry logic
      }

      // Log to external service
      this.errorLogger.log({
        method: method.name,
        error: error.message,
        timestamp: new Date().toISOString(),
        args: options.logArgs ? args : undefined
      });
    };
  }
}

// Usage
@Injectable()
export class ExternalApiService {
  @ErrorHandlingDecorator.afterThrowing({ retry: true, retryCount: 0, logArgs: true })
  async callExternalAPI(endpoint: string): Promise<ExternalData> {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    return response.json();
  }
}
```

### Configuration Options

#### AOPDecorator Generics
The `AOPDecorator` class uses TypeScript generics to provide strong typing and better IntelliSense support:

```ts
abstract class AOPDecorator<O>
```

**Generic Parameters:**
- **`O` (Options Type)**: defines the configuration options for your decorator

**Usage Examples:**

```ts
// Basic usage with default generics
@Aspect()
export class BasicDecorator extends AOPDecorator {
  // O = AOPOptions
}

// With custom options type
interface LoggingOptions {
  level: 'debug' | 'info' | 'warn' | 'error';
  includeTimestamp: boolean;
}

@Aspect()
export class LoggingDecorator extends AOPDecorator<LoggingOptions> {
  before({ method, options }: UnitAOPContext<LoggingOptions>) {
    return (...args: any[]) => {
      const timestamp = options.includeTimestamp ? `[${new Date().toISOString()}] ` : '';
      console.log(`${timestamp}${options.level.toUpperCase()}: ${method.name} called`);
    };
  }
}

// With return type and error type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

@Aspect()
export class ApiDecorator extends AOPDecorator {
  // `AOPOptions` here is the basic option type.
  afterReturning({ method, options, result }: ResultAOPContext<AOPOptions, ApiResponse<any>>) {
    return (...args: any[]) => {
      console.log(`✅ API call successful: ${method.name}`);
      // result is typed as ApiResponse<any>
      if (result.success) {
        console.log(`📊 Response data:`, result.data);
      }
    };
  }

  // `AOPOptions` here is the basic option type.
  afterThrowing({ method, options, error }: ErrorAOPContext<AOPOptions, Error>) {
    return (...args: any[]) => {
      console.error(`❌ API call failed: ${method.name}`, error.message);
      // error is typed as Error
    };
  }
}

// Usage with typed decorators
@Injectable()
export class UserService {
  @LoggingDecorator.before({
    level: 'info',
    includeTimestamp: true
  })
  async getUser(id: string): Promise<User> {
    // Method implementation
  }

  @ApiDecorator.afterReturning()
  async getUserData(id: string): Promise<ApiResponse<User>> {
    // Method implementation
  }
}
```

**Benefits of Using Generics:**

1. **Type Safety**: Catch type errors at compile time
2. **Better IntelliSense**: IDE provides accurate autocompletion
3. **Self-Documenting Code**: Types serve as documentation

**Context Types by Advice Type:**

```ts
// Before, After, Around advice
UnitAOPContext<O> = {
  method: Function;
  options: O;
}

// AfterReturning advice
ResultAOPContext<O, T> = {
  method: Function;
  options: O;
  result: T;  // Available only in afterReturning
}

// AfterThrowing advice
ErrorAOPContext<O, E> = {
  method: Function;
  options: O;
  error: E;   // Available only in afterThrowing
}
```

#### Multiple Decorators on Single Method
```ts
@Injectable()
export class ComplexService {
  @LoggingDecorator.before({ level: 'info', logArgs: true })
  @PerformanceDecorator.around({ threshold: 1000, logPerformance: true })
  @CachingDecorator.around({ ttl: 300000 })
  @ErrorHandlingDecorator.afterThrowing({ retry: true, logArgs: true })
  async complexOperation(data: ComplexData): Promise<ComplexResult> {
    // Method will be enhanced with:
    // 1. Logging before execution
    // 2. Performance monitoring around execution
    // 3. Caching around execution
    // 4. Error handling if something goes wrong
    return await this.processComplexData(data);
  }
}
```
```ts
@Injectable()
export class ComplexService {
  @LoggingDecorator.before({ level: 'info', logArgs: true })
  @PerformanceDecorator.around({ threshold: 1000, logPerformance: true })
  @CachingDecorator.around({ ttl: 300000 })
  @ErrorHandlingDecorator.afterThrowing({ retry: true, logArgs: true })
  async complexOperation(data: ComplexData): Promise<ComplexResult> {
    // Method will be enhanced with:
    // 1. Logging before execution
    // 2. Performance monitoring around execution
    // 3. Caching around execution
    // 4. Error handling if something goes wrong
    return await this.processComplexData(data);
  }
}
```

### Testing AOP Decorators

When testing with NestJS's TestingModule, ensure that you call the `init()` method to properly initialize the AOP system.

```ts
describe('AOP Integration (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AOPModule.forRoot()],
      providers: [LoggingDecorator, TestService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init(); // Required for AOP initialization
  });

  it('should apply AOP advice to service methods', () => {
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

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.
