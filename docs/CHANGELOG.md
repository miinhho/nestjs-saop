# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-XX

### Added
- ✨ Enhanced test coverage to 100% statements, 95.18% branches, 100% functions
- ✅ Expanded test suite from 83 to 90 comprehensive tests
- 🧪 Added `decoratorClass` field support in DecoratorApplier service
- 🧪 Added metadata validation tests for SAOPDecorator.create() method
- 🧪 Added error handling tests for `Object.getOwnPropertyNames` in MethodProcessor
- 🧪 Added execution verification tests for core service methods
- 📊 Achieved 100% coverage for DecoratorApplier, MethodProcessor, and SAOPDecorator services

### Enhanced
- 🔧 Improved DecoratorApplier service with `decoratorClass` field support for targeted decorator application
- 🔧 Enhanced MethodProcessor service error handling for prototype access failures
- 🔧 Strengthened SAOPDecorator base class with comprehensive metadata management
- 🧪 Added edge case testing for all major service methods
- 📈 Increased overall test coverage from 95.62% to 100% statements

### Fixed
- 🐛 Fixed potential issues with decorator application when `decoratorClass` is not specified
- 🐛 Improved error handling in method processing for malformed prototypes
- 🐛 Enhanced metadata validation for decorator creation

### Technical Improvements
- **Test Coverage**: 100% statements, 95.18% branches, 100% functions
- **Test Cases**: Expanded from 83 to 90 comprehensive test scenarios
- **Error Handling**: Enhanced error resilience in core services
- **Type Safety**: Improved type checking for decorator metadata
- **Performance**: Maintained zero runtime overhead for non-decorated methods

### Quality Metrics
- **Test Coverage**: 100% statements, 95.18% branches, 100% functions
- **Test Count**: 90 tests (up from 83)
- **Service Coverage**: 100% for DecoratorApplier, MethodProcessor, SAOPDecorator
- **Code Quality**: Maintained ESLint + Prettier standards
- **Type Safety**: Full TypeScript compliance

### Breaking Changes
- None

---

### Added
- ✨ Initial release of nestjs-saop
- ✅ Spring-style AOP decorators (`@Around`, `@Before`, `@After`, `@AfterReturning`, `@AfterThrowing`)
- ✅ Full TypeScript support with type safety
- ✅ Nest.js DiscoveryModule integration
- ✅ Comprehensive JSDoc documentation
- ✅ High test coverage (98.73%)
- ✅ Zero runtime dependencies (except peer dependencies)
- ✅ Flexible and extensible architecture
- ✅ Custom decorator options support
- ✅ Multiple decorators on single method
- ✅ Conditional AOP support
- 📚 Complete API documentation
- 💡 Usage examples and practical guides
- 🛠️ Development tools (ESLint, Prettier, Husky, lint-staged)
- 🧪 Comprehensive test suite with Jest
- 📦 Multiple package manager support (npm, yarn, pnpm)

### Features
- **AOP Decorators**: Full implementation of Spring-style AOP patterns
- **Type Safety**: Complete TypeScript support with generic types
- **Performance**: Zero runtime overhead for non-decorated methods
- **Flexibility**: Customizable options for each decorator
- **Integration**: Seamless integration with Nest.js ecosystem
- **Documentation**: Comprehensive docs with examples and API reference

### Technical Details
- **Framework**: Nest.js with DiscoveryModule
- **Language**: TypeScript 5.0+
- **Testing**: Jest with 98.73% coverage
- **Code Quality**: ESLint, Prettier, Husky, lint-staged
- **Build**: TypeScript compiler with custom tsconfig
- **Package**: ESM and CommonJS support

### Documentation
- 📖 [README.md](../README.md) - Main project documentation
- 📚 [API Reference](./api.md) - Complete API documentation
- 💡 [Usage Examples](./examples.md) - Practical examples and use cases
- 🛠️ [Contributing Guide](../CONTRIBUTING.md) - Development guidelines

### Breaking Changes
- None (initial release)

### Dependencies
- **Runtime**: None (peer dependencies only)
- **Peer Dependencies**:
  - `@nestjs/common`: ^10.0.0
  - `@nestjs/core`: ^10.0.0
  - `@nestjs/platform-express`: ^10.0.0
  - `reflect-metadata`: ^0.1.13
  - `rxjs`: ^7.8.1

### Development Dependencies
- `@types/jest`: ^29.5.8
- `@types/node`: ^20.9.0
- `@types/supertest`: ^2.0.16
- `@typescript-eslint/eslint-plugin`: ^6.12.0
- `@typescript-eslint/parser`: ^6.12.0
- `eslint`: ^8.54.0
- `eslint-config-prettier`: ^9.0.0
- `eslint-plugin-prettier`: ^5.0.1
- `husky`: ^8.0.3
- `jest`: ^29.7.0
- `lint-staged`: ^15.1.0
- `prettier`: ^3.1.0
- `supertest`: ^6.3.3
- `ts-jest`: ^29.1.1
- `typescript`: ^5.3.2

---

## Development Notes

### Project Structure
```
src/
├── decorators/          # AOP decorator implementations
├── interfaces/          # TypeScript type definitions
├── services/           # Core AOP processing services
└── index.ts           # Public API exports

docs/                   # Documentation
├── api.md             # API reference
├── examples.md        # Usage examples
└── ../README.md       # Main documentation

test/                  # Test files
├── app/              # Test application setup
└── *.spec.ts        # Unit and integration tests
```

### Quality Metrics
- **Test Coverage**: 98.73%
- **Code Quality**: ESLint + Prettier
- **Type Safety**: Strict TypeScript configuration
- **Documentation**: Complete JSDoc coverage

### Future Plans
- Additional AOP patterns support
- Performance monitoring integrations
- More comprehensive examples
- Plugin system for custom decorators
- Integration with popular Nest.js packages

---

[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format followed.
