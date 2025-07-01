module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  
  // The root directory that Jest should scan for tests
  roots: ['<rootDir>/src'],
  
  // File extensions Jest should look for
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  
  // Setup files to run before each test
  setupFiles: ['<rootDir>/src/tests/setup.js'],
  
  // Jest transformations - this is where you can configure support for
  // TypeScript, Babel, etc.
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Module name mapper to handle CSS and image imports
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  
  // Indicates whether the coverage information should be collected
  collectCoverage: true,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Test match patterns
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  
  // Jest watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Test timeout in milliseconds
  testTimeout: 10000,
  
  // Display help in the terminal when running tests
  verbose: true,
};
