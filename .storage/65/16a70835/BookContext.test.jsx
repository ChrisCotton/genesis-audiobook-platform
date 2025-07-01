import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { BookProvider, useBook } from '../../../contexts/BookContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { mockBooks, mockAnnotations, mockUploadFormData } from '../../__mocks__/mockData';

// Mock component to test the useBook hook
const BookTestComponent = () => {
  const { 
    books, 
    loading, 
    getBook, 
    addBook, 
    updateBookProgress, 
    addAnnotation,
    getBookAnnotations
  } = useBook();
  
  return (
    <div>
      <div data-testid="loading-status">
        {loading ? 'Loading' : 'Not loading'}
      </div>
      
      <div data-testid="books-count">
        {books.length}
      </div>
      
      {books.map(book => (
        <div key={book.id} data-testid={`book-${book.id}`}>
          <h3>{book.title}</h3>
          <p>{book.author}</p>
          <p data-testid={`progress-${book.id}`}>{book.progress}%</p>
        </div>
      ))}
      
      <button
        data-testid="get-book-button"
        onClick={() => {
          const book = getBook('1');
          if (book) {
            document.getElementById('book-details').textContent = book.title;
          }
        }}
      >
        Get Book Details
      </button>
      
      <div id="book-details"></div>
      
      <button
        data-testid="update-progress-button"
        onClick={() => updateBookProgress('1', 50)}
      >
        Update Progress
      </button>
      
      <button
        data-testid="add-book-button"
        onClick={() => {
          addBook(mockUploadFormData);
        }}
      >
        Add Book
      </button>
      
      <button
        data-testid="add-annotation-button"
        onClick={() => {
          addAnnotation('1', 'Test annotation', 42, 'yellow');
        }}
      >
        Add Annotation
      </button>
      
      <button
        data-testid="get-annotations-button"
        onClick={() => {
          const annotations = getBookAnnotations('1');
          document.getElementById('annotations-count').textContent = annotations.length;
        }}
      >
        Get Annotations
      </button>
      
      <div id="annotations-count"></div>
    </div>
  );
};

describe('BookContext', () => {
  // Mock auth context with a logged-in user
  const mockAuthContext = {
    currentUser: { id: '1', displayName: 'Test User' },
    isAuthenticated: true,
    isLoading: false
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('provides initial loading state and fetches books for current user', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BookProvider>
          <BookTestComponent />
        </BookProvider>
      </AuthContext.Provider>
    );
    
    // Initially should be in loading state
    expect(screen.getByTestId('loading-status')).toHaveTextContent('Loading');
    
    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
    });
    
    // Books should be loaded
    expect(screen.getByTestId('books-count')).toHaveTextContent(mockBooks.length.toString());
    
    // Each book's title should be displayed
    mockBooks.forEach(book => {
      expect(screen.getByText(book.title)).toBeInTheDocument();
    });
  });
  
  test('getBook function returns the correct book', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BookProvider>
          <BookTestComponent />
        </BookProvider>
      </AuthContext.Provider>
    );
    
    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
    });
    
    // Click on getBook button
    fireEvent.click(screen.getByTestId('get-book-button'));
    
    // Check if the book details are displayed correctly
    expect(document.getElementById('book-details').textContent).toBe(mockBooks[0].title);
  });
  
  test('updateBookProgress updates progress correctly', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BookProvider>
          <BookTestComponent />
        </BookProvider>
      </AuthContext.Provider>
    );
    
    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
    });
    
    // Get initial progress
    const initialProgress = screen.getByTestId('progress-1').textContent;
    
    // Update progress
    fireEvent.click(screen.getByTestId('update-progress-button'));
    
    // Wait for progress to update
    await waitFor(() => {
      expect(screen.getByTestId('progress-1').textContent).toBe('50%');
    });
    
    // Ensure progress was actually changed
    expect(screen.getByTestId('progress-1').textContent).not.toBe(initialProgress);
  });
  
  test('addBook adds a new book to the collection', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BookProvider>
          <BookTestComponent />
        </BookProvider>
      </AuthContext.Provider>
    );
    
    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
    });
    
    // Get initial book count
    const initialCount = parseInt(screen.getByTestId('books-count').textContent);
    
    // Add new book
    fireEvent.click(screen.getByTestId('add-book-button'));
    
    // Wait for book to be added
    await waitFor(() => {
      expect(screen.getByTestId('books-count').textContent).toBe((initialCount + 1).toString());
    });
    
    // New book title should appear
    expect(screen.getByText(mockUploadFormData.title)).toBeInTheDocument();
  });
  
  test('returns empty book array when user is not authenticated', async () => {
    // Mock auth context with no user
    const noUserAuthContext = {
      currentUser: null,
      isAuthenticated: false,
      isLoading: false
    };
    
    render(
      <AuthContext.Provider value={noUserAuthContext}>
        <BookProvider>
          <BookTestComponent />
        </BookProvider>
      </AuthContext.Provider>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
    });
    
    // Should have no books
    expect(screen.getByTestId('books-count')).toHaveTextContent('0');
  });
  
  test('annotations can be added and retrieved', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BookProvider>
          <BookTestComponent />
        </BookProvider>
      </AuthContext.Provider>
    );
    
    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
    });
    
    // Add annotation
    fireEvent.click(screen.getByTestId('add-annotation-button'));
    
    // Get annotations count
    fireEvent.click(screen.getByTestId('get-annotations-button'));
    
    // Initial mockAnnotations for book 1 + newly added annotation
    const expectedCount = mockAnnotations.filter(a => a.bookId === '1').length + 1;
    
    // Wait for annotations to load
    await waitFor(() => {
      expect(document.getElementById('annotations-count').textContent).toBe(expectedCount.toString());
    });
  });
});
