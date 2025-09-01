import js from '@eslint/js';
import tseslintParser from '@typescript-eslint/parser';
import { dirname } from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      'coverage/',
      '*.js',
      '*.config.js',
      '*.config.ts',
      'test/setup.ts',
      'example/**',
    ],
  },
  {
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },
];
