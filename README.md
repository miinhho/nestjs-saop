# nestjs-saop

[![npm version](https://badge.fury.io/js/nestjs-saop.svg)](https://badge.fury.io/js/nestjs-saop)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Test Coverage](https://img.shields.io/badge/coverage-98.73%25-brightgreen)](https://github.com/miinhho/nestjs-saop)

Spring S## Documentation

- 📖 [API Reference](./docs/api.md) - Complete API documentation
- 💡 [Usage Examples](./docs/examples.md) - Practical examples and use cases
- 📝 [Changelog](./docs/CHANGELOG.md) - Release notes and changes
- 🔧 [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the projectAOP (Aspect Oriented Programming) in Nest.js

## Features

- ✅ Spring-style AOP decorators (`@Around`, `@Before`, `@After`, etc.)
- ✅ TypeScript support with full type safety
- ✅ Zero runtime dependencies (except peer dependencies)
- ✅ High test coverage (98.73%)
- ✅ Nest.js DiscoveryModule integration
- ✅ Flexible and extensible architecture

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

> **✨ 새로운 기능**: `SAOPDecorator`를 상속받으면 `create()` 메소드가 자동으로 제공됩니다!

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
import { LoggingDecorator, CachingDecorator, PerformanceDecorator } from 'nestjs-saop';

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

> **참고**: 위 예제는 개념을 보여주기 위한 것입니다. 실제로는 `LoggingDecorator`, `CachingDecorator`, `PerformanceDecorator`를 직접 구현해야 합니다.

#### Function-based Decorators (Alternative)

```ts
import { LoggingDecoratorFn, CachingDecoratorFn, PerformanceDecoratorFn } from 'nestjs-saop';

@Controller()
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get('test')
  testEndpoint() {
    return this.exampleService.processData();
  }
}

export class ExampleService {
  @LoggingDecoratorFn({ level: 'info', logArgs: true, logResult: true })
  processData(data: any): string {
    return `Processed: ${data}`;
  }

  @CachingDecoratorFn({ ttl: 300000 }) // 5분 캐시
  async getUserById(id: string): Promise<User> {
    // DB 조회 로직
    return await this.userRepository.findById(id);
  }

  @PerformanceDecoratorFn({ logPerformance: true, threshold: 1000 })
  async expensiveOperation(): Promise<any> {
    // 시간이 오래 걸리는 작업
    await new Promise(resolve => setTimeout(resolve, 500));
    return { result: 'done' };
  }
}
```

> **참고**: 위 예제는 개념을 보여주기 위한 것입니다. 실제로는 `LoggingDecoratorFn`, `CachingDecoratorFn`, `PerformanceDecoratorFn`을 직접 구현해야 합니다.

#### Function-based Decorators (Legacy)

```ts
import { Around, Before, After, AfterReturning, AfterThrowing } from 'nestjs-saop';

@Controller()
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get('test')
  testEndpoint() {
    return this.exampleService.processData();
  }
}

export class ExampleService {
  @Around({ log: true, timing: true })
  processData(): string {
    return 'Processed data';
  }

  @Before({ validate: true })
  validateInput() {
    // Input validation logic
  }

  @After({ cleanup: true })
  cleanup() {
    // Cleanup logic
  }

  @AfterReturning({ cache: true })
  getCachedData(): string {
    return 'Cached result';
  }

  @AfterThrowing({ notify: true })
  handleError(): never {
    throw new Error('Something went wrong');
  }
}
```

## Available Decorators

| Decorator         | Description                      | Execution Point         |
| ----------------- | -------------------------------- | ----------------------- |
| `@Around`         | Wraps entire method execution    | Before → Method → After |
| `@Before`         | Executes before method           | Before method execution |
| `@After`          | Executes after method            | After method execution  |
| `@AfterReturning` | Executes after successful return | After successful return |
| `@AfterThrowing`  | Executes when method throws      | When exception occurs   |

## Advanced Usage

### Custom Options

```ts
@Around({
  log: true,
  timing: true,
  cache: { ttl: 300 },
  retry: { attempts: 3 }
})
async expensiveOperation() {
  // Your business logic
}
```

### Multiple Decorators

```ts
@Before({ validate: true })
@Around({ log: true })
@AfterReturning({ cache: true })
@AfterThrowing({ notify: true })
processOrder() {
  // Method with multiple aspects
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

# Run tests
pnpm test

# Run linting
pnpm lint

# Format code
pnpm format

# Build
pnpm build
```

### Project Structure

```
src/
├── decorators/          # AOP decorators
├── interfaces/          # TypeScript interfaces
├── services/           # Core AOP services
│   ├── instance-collector.service.ts
│   ├── method-processor.service.ts
│   └── decorator-applier.service.ts
├── saop.module.ts      # Main module
└── index.ts           # Public exports

test/
├── app/               # Test application
└── *.spec.ts         # Test files
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- test/saop.module.spec.ts

# Run tests in watch mode
npm test -- --watch
```

### Code Quality

This project uses several tools to maintain code quality:

- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Jest**: Testing framework with 98.73% coverage
- **Husky**: Git hooks for pre-commit quality checks
- **lint-staged**: Run linters on staged files
- **Commitizen**: Standardized commit messages

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Run linting: `npm run lint`
7. Format code: `npm run format`
8. Commit your changes: `npm run commit`
9. Push to the branch: `git push origin feature/amazing-feature`
10. Open a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://conventionalcommits.org/). Use `npm run commit` or follow the pattern:

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Documentation

- 📖 [API Reference](./docs/api.md) - Complete API documentation
- � [Usage Examples](./docs/examples.md) - Practical examples and use cases
- � [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes.

---

Made with ❤️ for the Nest.js community
