# 🤝 Contributing to nestjs-saop

Thank you for your interest in contributing to nestjs-saop! We welcome contributions from the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Style](#code-style)
- [Documentation](#documentation)

## 🤝 Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/nestjs-saop.git
   cd nestjs-saop
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up development environment**
   ```bash
   # Run tests
   pnpm test

   # Run linter
   pnpm run lint

   # Build the project
   pnpm build
   ```

## 🔧 Making Changes

### Branch Naming Convention

- `feature/` - New features
- `bugfix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test-related changes

Example: `feature/add-custom-decorator-support`

### Commit Message Format

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Test additions/changes
- `chore` - Maintenance tasks

Examples:
```
feat(decorator): add support for custom decorator options
fix(core): resolve memory leak in decorator applier
docs(api): update decorator usage examples
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test -- test/decorator-applier.service.spec.ts

# Run tests in watch mode
pnpm test -- --watch
```

### Test Coverage Requirements

- **Statements**: 90% minimum
- **Branches**: 80% minimum
- **Functions**: 85% minimum
- **Lines**: 90% minimum

### Writing Tests

- Use descriptive test names
- Follow the existing test structure
- Include both positive and negative test cases
- Test error conditions and edge cases
- Mock external dependencies appropriately

## 📝 Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for public APIs
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### ESLint & Prettier

The project uses ESLint and Prettier for code formatting:

```bash
# Check linting
pnpm run lint

# Fix linting issues automatically
pnpm run lint -- --fix

# Check formatting
pnpm format --check

# Format code
pnpm run format
```

### Import Order

```typescript
// 1. Node.js built-ins
import { readFileSync } from 'fs';

// 2. External libraries
import { Injectable } from '@nestjs/common';

// 3. Internal modules (relative imports)
import { SAOPDecorator } from './saop-decorator.interface';

// 4. Types (if separate from implementation)
import type { AOPContext } from './types';
```

## 📚 Documentation

### API Documentation

- Update JSDoc comments for any new public APIs
- Update `docs/api.md` for API changes
- Update `docs/examples.md` with usage examples

### README Updates

- Update README.md for significant changes
- Keep installation and quick start guides current
- Update feature lists and examples

### Changelog

Update `docs/CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [1.1.0] - 2025-01-XX

### Added
- New feature description

### Changed
- Changed feature description

### Fixed
- Bug fix description
```

## 📞 Getting Help

- 📖 [Documentation](docs/README.md)
- 🐛 [Issue Tracker](https://github.com/your-username/nestjs-saop/issues)
- 💬 [Discussions](https://github.com/your-username/nestjs-saop/discussions)

Thank you for contributing to nestjs-saop! 🎉
