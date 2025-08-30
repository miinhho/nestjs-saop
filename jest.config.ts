/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/*.spec.ts', '<rootDir>/test/*.e2e-spec.ts'],

  // Stop running tests after `n` failures
  bail: 1,

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ['/node_modules/', '/test/', '/dist/', '/coverage/'],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90,
    },
  },

  // The maximum amount of workers used to run your tests
  maxWorkers: '50%',

  // An array of file extensions your modules use
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // A map from regular expressions to module names or to arrays of module names
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },

  // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/coverage/'],

  // Automatically reset mock state before every test
  resetMocks: true,

  // Automatically restore mock state and implementation before every test
  restoreMocks: true,

  // The root directory that Jest should scan for tests and modules within
  rootDir: '.',

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/src', '<rootDir>/test'],

  // The paths to modules that run some code to configure or set up the testing environment before each test
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],

  // The number of seconds after which a test is considered as slow and reported as such in the results
  slowTestThreshold: 5,

  // The test environment that will be used for testing
  // testEnvironment: "jest-environment-node",

  // Options that will be passed to the testEnvironment
  // testEnvironmentOptions: {},

  // Adds a location field to test results
  testLocationInResults: true,

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],

  // This option allows use of a custom test runner
  testRunner: 'jest-circus',

  // An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them
  unmockedModulePathPatterns: ['reflect-metadata'],

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
  watchPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/coverage/', '<rootDir>/node_modules/'],
};

export default config;
