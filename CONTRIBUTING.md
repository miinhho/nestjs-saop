# Contributing to nestjs-saop

We welcome contributions to the nestjs-saop project! This document provides guidelines and information for contributors.

## Development Environment Setup

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- Git

### Initial Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/miinhho/nestjs-saop.git
   cd nestjs-saop
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Initialize husky (Git hooks)**

   ```bash
   pnpm run prepare
   ```

4. **Verify setup**
   ```bash
   pnpm test
   pnpm lint
   pnpm build
   ```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 2. Make Your Changes

- Write clean, well-documented code
- Add tests for new functionality
- Ensure all tests pass: `pnpm test`
- Run linting: `pnpm lint`
- Format code: `pnpm format`

### 3. Commit Your Changes

This project uses [Conventional Commits](https://conventionalcommits.org/). Use the interactive commit tool:

```bash
pnpm run commit
```

This will guide you through creating a properly formatted commit message.

#### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

**Examples:**

```
feat(auth): add JWT token validation
fix(api): resolve memory leak in SAOPModule
docs(readme): update installation instructions
test(decorators): add unit tests for Around decorator
```

### 4. Pre-commit Hooks

The project uses husky and lint-staged to ensure code quality:

- **Pre-commit**: Runs linting and formatting on staged files
- **Commit-msg**: Validates commit message format

These hooks run automatically when you commit. If they fail, fix the issues and try again.

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with a clear description of your changes.

## Code Quality Standards

### TypeScript

- Use strict TypeScript configuration
- Provide proper type annotations
- Avoid `any` type when possible
- Use interfaces for complex types

### Testing

- Maintain high test coverage (>95%)
- Write unit tests for all new features
- Write integration tests for complex functionality
- Use descriptive test names

### Code Style

- Follow ESLint configuration
- Use Prettier for consistent formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

## Project Structure

```
src/
├── decorators/          # AOP decorator implementations
├── interfaces/          # TypeScript interfaces and types
├── services/           # Core AOP services
│   ├── instance-collector.service.ts
│   ├── method-processor.service.ts
│   └── decorator-applier.service.ts
├── saop.module.ts      # Main module
└── index.ts           # Public exports

test/
├── app/               # Test application setup
└── *.spec.ts         # Unit and integration tests
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test -- test/saop.module.spec.ts

# Run tests in watch mode
pnpm test -- --watch
```

### Writing Tests

- Use Jest as the testing framework
- Place test files next to the code they test
- Use descriptive test names and structure
- Mock external dependencies when necessary

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for new public APIs
- Update examples if new features are added
- Keep API documentation in sync

## Pull Request Process

1. Ensure all CI checks pass
2. Request review from maintainers
3. Address review comments
4. Squash commits if requested
5. Merge when approved

## Issue Reporting

- Use GitHub Issues for bug reports and feature requests
- Provide clear reproduction steps for bugs
- Include relevant code snippets and error messages
- Specify your environment (Node.js version, OS, etc.)

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing, feel free to:

- Open a GitHub Discussion
- Join our community chat (if available)
- Contact the maintainers

Thank you for contributing to nestjs-saop! 🎉
