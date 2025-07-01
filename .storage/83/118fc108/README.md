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


## Test Structure

Tests are organized in a directory structure that mirrors the source code:


## Adding New Tests

1. Create a new test file following the naming convention: `ComponentName.test.jsx`
2. Import the component and testing utilities:


3. Write test cases using the describe/test pattern:


## Mock Data

Common mock data can be found in `src/tests/__mocks__/mockData.js`. Add new mock data there to maintain consistency across tests.

Examples of available mock data:
- Books, annotations, highlights
- Quiz questions and results  
- User authentication data
- Voice/Audio preferences

## Testing Best Practices

1. **Test behavior, not implementation** - Focus on what the component does, not how it does it
2. **Keep tests isolated** - Each test should be independent of others
3. **Mock external dependencies** - Use mocks for APIs, contexts, and services
4. **Test user interactions** - Use `fireEvent` to simulate clicks, typing, etc.
5. **Test accessibility** - Ensure components are accessible by using proper roles and labels
6. **Test error states** - Ensure components handle errors gracefully

## Web Speech API Testing

The Web Speech API is mocked in `setup.js`. Use the mocks to test voice synthesis features:

