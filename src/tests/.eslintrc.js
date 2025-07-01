module.exports = {
  env: {
    jest: true,
    browser: true,
    node: true
  },
  plugins: [
    'jest'
  ],
  extends: [
    'plugin:jest/recommended'
  ],
  rules: {
    'no-undef': 'off', // Disable no-undef since Jest globals are defined in the test environment
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error', 
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error'
  },
  globals: {
    // Define global objects used in tests
    describe: true,
    test: true,
    expect: true,
    beforeEach: true,
    afterEach: true,
    beforeAll: true,
    afterAll: true,
    jest: true,
    it: true,
    act: true
  }
};