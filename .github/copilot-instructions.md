## Project Overview

**nestjs-saop** is a TypeScript library that brings Spring-style Aspect Oriented Programming (AOP) to Nest.js applications. It provides decorators and services to implement cross-cutting concerns like logging, caching, performance monitoring, and error handling.

## Key Concepts

### AOP Principles

- **Aspect**: Cross-cutting concern (logging, caching, security)
- **Join Point**: Point in program execution where aspect can be applied
- **Advice**: Action taken at join point (before, after, around)
- **Pointcut**: Expression that matches join points

### Core Components

#### 1. SAOPDecorator Base Class

```typescript
abstract class SAOPDecorator<T = unknown, E = unknown> implements ISAOPDecorator<T, E> {
  static create(options: SAOPOptions): MethodDecorator;
  // AOP method implementations...
}
```

#### 2. Core Services

- **InstanceCollectorService**: Discovers AOP decorator instances
- **MethodProcessorService**: Processes methods for AOP application
- **DecoratorApplierService**: Applies decorators to target methods

## Development Guidelines

### Code Style

- Use TypeScript with strict mode
- Follow ESLint and Prettier configurations
- Maintain +90% test coverage
- Use conventional commits
- Follow Nest.js patterns and conventions

### Testing Strategy

- Unit tests for all services and utilities
- Integration tests for AOP functionality
- E2E tests for complete workflows
- Mock external dependencies
- Use Jest with coverage reporting

### File Organization

```
src/
├── decorators/     # AOP decorator implementations
├── interfaces/     # Type definitions
├── services/       # Core business logic
└── *.ts           # Module files

test/
├── *.spec.ts      # Unit tests
├── *.e2e-spec.ts  # E2E tests
└── setup.ts      # Test configuration
```

## Best Practices

### 1. Error Handling

- Always handle errors in AOP advice
- Use appropriate error types
- Log errors with context
- Don't suppress errors unless intentional

### 2. Performance Considerations

- Keep AOP logic lightweight
- Cache expensive operations
- Use async/await for I/O operations
- Profile performance-critical aspects

### 3. Type Safety

- Use generic types for type safety
- Define proper interfaces
- Avoid `any` types
- Leverage TypeScript's type system

### 4. Testing AOP

- Test aspects in isolation
- Mock dependencies
- Test error scenarios
- Verify advice execution order

## Integration with Nest.js

### Module Setup

```typescript
@Module({
  imports: [
    SAOPModule.forRoot(),
    // other modules
  ],
  providers: [
    LoggingDecorator,
    PerformanceDecorator,
    // other providers
  ],
})
export class AppModule {}
```

### Controller Usage

```typescript
@Controller()
export class ExampleController {
  @LoggingDecorator.create({ level: 'info' })
  @PerformanceDecorator.create({ threshold: 1000 })
  async processData(@Body() data: any) {
    // Business logic
  }
}
```

## Troubleshooting

### Common Issues

1. **Decorators not applied**: Check SAOPModule registration
2. **Type errors**: Verify interface implementations
3. **Performance issues**: Profile AOP advice execution
4. **Test failures**: Check test setup and mocking

### Debug Tips

- Enable verbose logging in development
- Use debugger statements in AOP advice
- Check method metadata with Reflect API
- Verify decorator execution order
