import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookCard from '../../../components/book/BookCard';
import { mockBooks } from '../../__mocks__/mockData';

// Mock the Link component to avoid router errors
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ to, children, className }) => (
    <a href={to} className={className} data-testid="mock-link">
      {children}
    </a>
  ),
}));

describe('BookCard Component', () => {
  const mockBook = mockBooks[0];

  test('renders book title and author correctly', () => {
    render(<BookCard book={mockBook} />);
    
    expect(screen.getByText(mockBook.title)).toBeInTheDocument();
    expect(screen.getByText(`by ${mockBook.author}`)).toBeInTheDocument();
  });

  test('displays correct progress bar width', () => {
    render(<BookCard book={mockBook} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle(`width: ${mockBook.progress}%`);
  });

  test('displays book tags correctly', () => {
    render(<BookCard book={mockBook} />);
    
    mockBook.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  test('displays correct read status indicator for in-progress book', () => {
    render(<BookCard book={mockBook} />);
    
    expect(screen.getByText(`${mockBook.progress}% Read`)).toBeInTheDocument();
  });

  test('displays "New" status for books with 0 progress', () => {
    const newBook = { ...mockBook, progress: 0 };
    render(<BookCard book={newBook} />);
    
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  test('displays "Completed" status for books with 100% progress', () => {
    const completedBook = { ...mockBook, progress: 100 };
    render(<BookCard book={completedBook} />);
    
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('displays audio narration indicator when available', () => {
    render(<BookCard book={mockBook} />);
    
    expect(screen.getByTitle('Audio narration available')).toBeInTheDocument();
  });

  test('formats date correctly', () => {
    render(<BookCard book={mockBook} />);
    
    // Check date formatting
    const date = new Date(mockBook.lastOpened);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    expect(screen.getByText(`Last read: ${formattedDate}`)).toBeInTheDocument();
  });

  test('handles missing cover image with fallback', () => {
    render(<BookCard book={mockBook} />);
    
    // Simulate image error event
    const coverImage = screen.queryByAlt(`Cover of ${mockBook.title}`);
    if (coverImage) {
      fireEvent.error(coverImage);
      // After error, fallback should be visible
      expect(coverImage).toHaveStyle('display: none');
    } else {
      // If no image found, fallback div should be visible
      expect(screen.getByRole('figure')).toBeInTheDocument();
    }
  });

  test('links to correct book detail page', () => {
    render(<BookCard book={mockBook} />);
    
    const link = screen.getByTestId('mock-link');
    expect(link).toHaveAttribute('href', `/book/${mockBook.id}`);
  });
});