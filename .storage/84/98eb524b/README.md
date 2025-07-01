# Genesis Testing Documentation

This folder contains all test files for the Genesis interactive audiobook platform. The project uses Jest and React Testing Library for unit and component testing.

## Table of Contents

- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Adding New Tests](#adding-new-tests)
- [Mock Data](#mock-data)
- [Testing Best Practices](#testing-best-practices)

## Getting Started

The testing framework is set up with:

- Jest for test running and assertions
- React Testing Library for component testing
- JSDOM for browser environment simulation
- Mock implementations for Web Speech API and other browser features

## Running Tests

Run tests using the npm scripts defined in package.json:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized in a directory structure that mirrors the source code:

```
tests/
├── __mocks__/            # Mock implementations for tests
├── components/           # Component tests
│   ├── book/            
│   ├── conversation/    
│   ├── layout/         
│   └── learning/        
├── contexts/            # Context tests
├── pages/               # Page component tests
└── setup.js            # Test environment setup
