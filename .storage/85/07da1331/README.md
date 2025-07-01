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
```

## Adding New Tests

When adding new tests:

1. Create test files with the `.test.jsx` suffix
2. Place tests in the corresponding directory that matches the component's location
3. Import the component and any necessary mock data
4. Follow the AAA pattern: Arrange, Act, Assert

Example:

```jsx
import { render, screen } from '@testing-library/react';
import MyComponent from '../../../components/path/to/MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    // Arrange
    render(<MyComponent prop="value" />);
    
    // Act - user interactions if needed
    
    // Assert
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Mock Data

Mock data for tests is stored in `__mocks__/mockData.js`. Add new mock data there to keep tests consistent.

## Testing Best Practices

1. **Test behavior, not implementation** - Focus on what users would see and do
2. **Keep tests isolated** - Each test should be independent of others
3. **Mock external dependencies** - API calls, browser APIs, etc.
4. **Use data-testid for elements without text** - Add `data-testid` attributes to elements that don't have distinct text
5. **Test error states** - Make sure components handle errors gracefully
6. **Balance coverage and maintenance** - Aim for good coverage without brittle tests
7. **Test accessibility** - Use aXe or similar tools to check accessibility

For more detailed guidance, refer to the [React Testing Library documentation](https://testing-library.com/docs/react-testing-library/intro/).
