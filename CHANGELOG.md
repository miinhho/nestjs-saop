# Changelog

## [0.2.0] - 2025.09.09

### Fixed
- Type error when using a number or symbol as an AOP option key.


## [0.1.1] - 2025.09.01

### Fixed
- Changed npm packages to only include source code, README.md, and LICENSE.


## [0.1.0] - 2025-09-01

### Added
- **Initial release** of nestjs-saop - Spring-style AOP (Aspect Oriented Programming) for NestJS
- **Complete AOP Advice Types**: Support for all 5 Spring-style AOP advice types:
  - `around`: Complete control over method execution (before, during, and after)
  - `before`: Execute advice before method invocation
  - `after`: Execute advice after method completion (regardless of success/failure)
  - `afterReturning`: Execute advice only when method completes successfully
  - `afterThrowing`: Execute advice only when method throws an exception
- **Full TypeScript Support**: Complete type safety with generics and interfaces
  - Strongly typed AOP contexts and options
  - Generic support for method return types and error types
  - IntelliSense support for all AOP operations
- **Runtime Method Interception**: Dynamic method wrapping and advice application
  - Automatic discovery and application of AOP decorators
  - Runtime method modification without source code changes
  - Support for both synchronous and asynchronous methods
- **NestJS Integration**: Seamless integration with NestJS module system
  - `AOPModule.forRoot()` for global AOP configuration
  - Automatic instance discovery using NestJS DiscoveryModule
  - Compatible with all NestJS dependency injection patterns
- **Robust Error Handling**: Comprehensive error handling throughout the AOP pipeline
  - Graceful handling of prototype access failures
  - Safe metadata retrieval with fallbacks
  - Exception propagation in after-throwing advice
- **Flexible Configuration**: Highly configurable AOP options and contexts
  - Custom options support through `AOPOptions` interface
  - Conditional AOP execution based on runtime conditions
  - Multiple decorators per method with different configurations
- **Decorator Pattern Implementation**: Clean decorator-based API
  - `@Aspect()` decorator for AOP class identification
  - Static method decorators for easy application
  - Interface-based AOP decorator contracts
- **Documentation**: Complete README with installation guide, quick start, and examples
- **Development Tools**: ESLint configuration, Jest setup, and build tools

### Example Usage

```typescript
import { AOPModule } from 'nestjs-saop';

@Module({
  imports: [AOPModule.forRoot()],
  providers: [LoggingDecorator],
})
export class AppModule {}

@Aspect()
export class LoggingDecorator extends AOPDecorator {
  before({ method, options }) {
    return (...args: any[]) => {
      console.log('Method called with:', ...args);
    };
  }
}
```