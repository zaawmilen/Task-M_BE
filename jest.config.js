// jest.config.ts
module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',  // For ES6 modules
  },
  transformIgnorePatterns: [
    "node_modules/(?!(chai)/)",  // Add 'chai' to be transformed
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 60000,
  globalTeardown: '<rootDir>/tests/teardown.ts',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/tests/**/*.test.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageProvider: "v8",
  collectCoverageFrom: ['**/app.ts', '**/routes/**/*.ts', '!**/node_modules/**'],
};
