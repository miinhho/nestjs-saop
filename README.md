# nestjs-saop

[![npm version](https://badge.fury.io/js/nestjs-saop.svg)](https://badge.fury.io/js/nestjs-saop)
[![codecov](https://codecov.io/github/miinhho/nestjs-saop/graph/badge.svg?token=XXUGSS0MWV)](https://codecov.io/github/miinhho/nestjs-saop)

Spring style AOP (Aspect Oriented Programming) in Nest.js

## Features

- ✅ TypeScript support with full type safety
- ✅ Zero runtime dependencies (except peer dependencies)

## Installation

**Currently Under Development**
-> Not published yet

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

@Controller()
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get('test')
  testEndpoint() {
    return this.exampleService.processData();
  }
}

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
