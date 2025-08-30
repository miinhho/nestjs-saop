# nestjs-saop

[![npm version](https://badge.fury.io/js/nestjs-saop.svg)](https://badge.fury.io/js/nestjs-saop)
[![codecov](https://codecov.io/github/miinhho/nestjs-saop/graph/badge.svg?token=XXUGSS0MWV)](https://codecov.io/github/miinhho/nestjs-saop)

Spring AOP (Aspect Oriented Programming) in Nest.js

## Features

- ✅ TypeScript support with full type safety
- ✅ Zero runtime dependencies (except peer dependencies)

## Documentation

- 📖 [API Reference](./docs/api.md)
- 💡 [Usage Examples](./docs/examples.md)
- 📝 [Changelog](./docs/CHANGELOG.md)
- 🔧 [Contributing Guide](./CONTRIBUTING.md)
- ✅ Nest.js DiscoveryModule integration
- ✅ Flexible and extensible architecture
- ✅ Modern development workflow with husky, lint-staged, and commitizen

## Installation

```bash
npm install nestjs-saop
# or
yarn add nestjs-saop
# or
pnpm add nestjs-saop
```

## Quick Start

### 1. Import SAOPModule

```ts
import { SAOPModule } from 'nestjs-saop';

@Module({
  imports: [
    // ... other modules
    SAOPModule.forRoot(),
  ],
})
export class AppModule {}
```

### 2. Create AOP Decorator Implementation

```ts
import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from 'nestjs-saop';

@Injectable()
export class LoggingDecorator extends SAOPDecorator {
  around({ method, options }: { method: Function; options: any }): (...args: any[]) => string {
    return (...args: any[]) => {
      console.log('🔄 Around: Before method call', ...args);
      const result = method.apply(this, args);
      console.log('🔄 Around: After method call', result);
      return result;
    };
  }

  before({ method, options }: { method: Function; options: any }): (...args: any[]) => void {
    return (...args: any[]) => {
      console.log('▶️ Before: Method called with', ...args);
    };
  }

  after({ method, options }: { method: Function; options: any }): (...args: any[]) => void {
    return (...args: any[]) => {
      console.log('⏹️ After: Method completed');
    };
  }

  afterReturning({
    method,
    options,
    result,
  }: {
    method: Function;
    options: any;
    result: string;
  }): (...args: any[]) => void {
    return (...args: any[]) => {
      console.log('✅ AfterReturning: Method returned', result);
    };
  }

  afterThrowing({
    method,
    options,
    error,
  }: {
    method: Function;
    options: any;
    error: Error;
  }): (...args: any[]) => void {
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

#### Class-based Decorators (Recommended - Nest.js UseInterceptor() style)

```ts
import { LoggingDecorator, CachingDecorator, PerformanceDecorator } from 'example-path';

@Controller()
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get('test')
  testEndpoint() {
    return this.exampleService.processData();
  }
}

export class ExampleService {
  @LoggingDecorator.create({ level: 'info', logArgs: true, logResult: true })
  processData(data: any): string {
    return `Processed: ${data}`;
  }

  @CachingDecorator.create({ ttl: 300000 }) // 5분 캐시
  async getUserById(id: string): Promise<User> {
    // DB 조회 로직
    return await this.userRepository.findById(id);
  }

  @PerformanceDecorator.create({ logPerformance: true, threshold: 1000 })
  async expensiveOperation(): Promise<any> {
    // 시간이 오래 걸리는 작업
    await new Promise(resolve => setTimeout(resolve, 500));
    return { result: 'done' };
  }
}
```

### Conditional AOP

```ts
@Injectable()
export class ConditionalDecorator implements SAOPDecorator {
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

## API Reference

### ISAOPDecorator<T, E>

Interface for implementing AOP logic with full TypeScript support.

```ts
interface ISAOPDecorator<T = unknown, E = unknown> {
  around?(context: { method: Function; options: any }): (...args: any[]) => T;
  before?(context: { method: Function; options: any }): (...args: any[]) => void;
  after?(context: { method: Function; options: any }): (...args: any[]) => void;
  afterReturning?(context: { method: Function; options: any; result: T }): (...args: any[]) => void;
  afterThrowing?(context: { method: Function; options: any; error: E }): (...args: any[]) => void;
}
```

### SAOPDecorator<T, E>

Base class that automatically provides the `create()` method for Nest.js UseInterceptor() style usage.

```ts
abstract class SAOPDecorator<T = unknown, E = unknown> implements ISAOPDecorator<T, E> {
  static create(options: SAOPOptions): MethodDecorator;
  // ... AOP method implementations
}
```

### SAOPOptions

Type for decorator options (fully customizable).

```ts
interface SAOPOptions {
  [key: string]: any;
}
```

## Development

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- TypeScript 5.0+

### Setup

```bash
# Clone the repository
git clone https://github.com/miinhho/nestjs-saop.git
cd nestjs-saop

# Install dependencies
pnpm install

# Initialize husky (sets up git hooks)
pnpm run prepare

# Run tests
pnpm test

# Run linting
pnpm lint

# Format code
pnpm format

# Build
pnpm build
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.
