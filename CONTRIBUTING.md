# Contributing to nestjs-saop

We welcome contributions to the nestjs-saop project! This document provides guidelines and information for contributors.

## Development Environment Setup

### Prerequisites

- Node.js 20+
- pnpm
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

## Code Quality Standards

### TypeScript

- Use strict TypeScript configuration
- Provide proper type annotations
- Avoid `any` type when possible

### Testing

- Write unit tests for all new features
- Write integration tests for complex functionality
- Use descriptive test names

### Code Style

- Follow ESLint configuration
- Use Prettier for consistent formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

## Documentation

- Add JSDoc comments for new public APIs
- Update examples if new features are added
- Keep API documentation in sync

## Pull Request Process

1. Ensure all CI checks pass
2. Request review from maintainers
3. Address review comments
4. Squash commits if requested
5. Merge when approved

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing, feel free to:

- Open a GitHub Discussion
- Contact the maintainers

Thank you for contributing to nestjs-saop! 🎉
