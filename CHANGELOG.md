# Changelog

## [0.4.0] - 2025.12.03

### What's Changed

* feature: added class-level AOP decorator, applied to all public methods of the class automatically by @miinhho

**Full Changelog**: https://github.com/miinhho/nestjs-saop/compare/v0.3.4...v0.4.0

## [0.3.5] - 2025.10.01

### What's Changed
* fix: useFactory provider support with AOP by @miinhho, @zeldigas in https://github.com/miinhho/nestjs-saop/pull/33

**Full Changelog**: https://github.com/miinhho/nestjs-saop/compare/v0.3.4...v0.3.5

## [0.3.4] - 2025.09.30

### What's Changed
* feature: remove invalidateClassCache method by @miinhho in https://github.com/miinhho/nestjs-saop/pull/27
* Fixed absolute import by @zeldigas in https://github.com/miinhho/nestjs-saop/pull/29

### New Contributors
* @zeldigas made their first contribution in https://github.com/miinhho/nestjs-saop/pull/29

**Full Changelog**: https://github.com/miinhho/nestjs-saop/compare/v0.3.3...v0.3.4

## [0.3.3] - 2025.09.14

### What's Changed
- modify JSDoc comments in `AOPDecorator`
- fix type error in `AOPDecorator` DI 

**Full Changelog**: https://github.com/miinhho/nestjs-saop/compare/v0.3.2...v0.3.3

## [0.3.2] - 2025.09.14

### What's Changed
- remove map cache layer in method processor
- now importing `AOPModule` in nestjs module is supported.

**Full Changelog**: https://github.com/miinhho/nestjs-saop/compare/v0.3.1...v0.3.2

## [0.3.1] - 2025.09.12

### What's Changed
- fixed original method access using around
- add `AroundAOPContext` which contains original method metadata and the proceed function to continue execution

**Full Changelog**: https://github.com/miinhho/nestjs-saop/compare/v0.3.0...v0.3.1

## [0.3.0] - 2025.09.12

### What's Changed
- added `order` option to `@Aspect` which a smaller order value will be executed first. (default is `Number.MAX_SAFE_INTEGER`)
- add comprehensive caching system for AOP method processing for performance optimize and prevent duplicate AOP processing
- Changed execution cycle (Around -> Before -> (AfterReturning/AfterThrowing) -> After -> Around)
- drop number option key support due to `Reflect` api

**Full Changelog**: https://github.com/miinhho/nestjs-saop/compare/v0.2.0...v0.3.0

## [0.2.0] - 2025.09.09

### What's Changed
- support number symbol key by @miinhho in https://github.com/miinhho/nestjs-saop/pull/5
- change generic type names more descriptively by @miinhho in https://github.com/miinhho/nestjs-saop/pull/3
- chore: remove cz by @miinhho in https://github.com/miinhho/nestjs-saop/pull/4

**Full Changelog**: https://github.com/miinhho/nestjs-saop/compare/v0.1.1...v0.2.0


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