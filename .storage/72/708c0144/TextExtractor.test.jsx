import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TextExtractor from '../../../components/book/TextExtractor';

// Mock file reading functions
const mockFileReader = {
  onload: null,
  readAsArrayBuffer: jest.fn(function() {
    this.onload({ target: { result: 'mock file content' } });
  }),
  readAsText: jest.fn(function() {
    this.onload({ target: { result: 'mock file content as text' } });
  }),
};

global.FileReader = jest.fn(() => mockFileReader);

// Mock PDF.js library
jest.mock('pdfjs-dist', () => ({
  getDocument: jest.fn().mockResolvedValue({
    numPages: 3,
    getPage: jest.fn().mockResolvedValue({
      getTextContent: jest.fn().mockResolvedValue({
        items: [
          { str: 'Page 1 text content' },
          { str: 'More text on page 1' }
        ]
      })
    })
  }),
  GlobalWorkerOptions: {
    workerSrc: ''
  }
}));

// Mock EPUB.js
jest.mock('epubjs', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    loaded: {
      metadata: Promise.resolve({
        title: 'Test EPUB Book',
        creator: 'Test Author'
      })
    },
    ready: Promise.resolve(),
    spine: {
      items: [
        { index: 0, href: 'chapter1.xhtml' },
        { index: 1, href: 'chapter2.xhtml' }
      ]
    },
    locations: {
      generate: jest.fn().mockResolvedValue(true),
      total: 100
    },
    renderer: {
      next: jest.fn().mockResolvedValue(true),
      display: jest.fn().mockResolvedValue({
        contents: {
          textContent: 'Chapter text content'
        }
      })
    }
  }))
}));

describe('TextExtractor Component', () => {
  const mockOnComplete = jest.fn();
  const mockOnProgress = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders file upload and format selection', () => {
    render(
      <TextExtractor 
        onComplete={mockOnComplete}
        onProgress={mockOnProgress}
      />
    );
    
    // Check if component renders input and format selector
    expect(screen.getByText('Extract Text from Document')).toBeInTheDocument();
    expect(screen.getByLabelText('Select file')).toBeInTheDocument();
    expect(screen.getByLabelText('File format')).toBeInTheDocument();
  });
  
  test('handles PDF extraction', async () => {
    render(
      <TextExtractor 
        onComplete={mockOnComplete}
        onProgress={mockOnProgress}
      />
    );
    
    // Select PDF format
    fireEvent.change(screen.getByLabelText('File format'), { target: { value: 'pdf' } });
    
    // Upload file
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText('Select file');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Check progress reporting
    expect(mockOnProgress).toHaveBeenCalledWith(0);
    
    // Wait for extraction to complete
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.any(Array),
        title: expect.any(String),
        pages: expect.any(Number)
      }));
    });
    
    // Check progress reporting at completion
    expect(mockOnProgress).toHaveBeenCalledWith(100);
  });
  
  test('handles EPUB extraction', async () => {
    render(
      <TextExtractor 
        onComplete={mockOnComplete}
        onProgress={mockOnProgress}
      />
    );
    
    // Select EPUB format
    fireEvent.change(screen.getByLabelText('File format'), { target: { value: 'epub' } });
    
    // Upload file
    const file = new File(['dummy content'], 'test.epub', { type: 'application/epub+zip' });
    const fileInput = screen.getByLabelText('Select file');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Wait for extraction to complete
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.any(Array),
        title: 'Test EPUB Book',
        author: 'Test Author'
      }));
    });
  });
  
  test('handles plain text extraction', async () => {
    render(
      <TextExtractor 
        onComplete={mockOnComplete}
        onProgress={mockOnProgress}
      />
    );
    
    // Select TXT format
    fireEvent.change(screen.getByLabelText('File format'), { target: { value: 'txt' } });
    
    // Upload file
    const file = new File(['This is plain text content\n\nWith multiple paragraphs'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText('Select file');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Wait for extraction to complete
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.arrayContaining(['This is plain text content', 'With multiple paragraphs']),
        title: 'test.txt'
      }));
    });
  });
  
  test('provides meaningful error message for unsupported format', async () => {
    render(
      <TextExtractor 
        onComplete={mockOnComplete}
        onProgress={mockOnProgress}
      />
    );
    
    // Upload unsupported file
    const file = new File(['dummy content'], 'test.doc', { type: 'application/msword' });
    const fileInput = screen.getByLabelText('Select file');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Should show error
    await waitFor(() => {
      expect(screen.getByText('Unsupported file format. Please upload PDF, EPUB, or TXT files.')).toBeInTheDocument();
    });
    
    // onComplete shouldn't be called
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
  
  test('handles extraction errors gracefully', async () => {
    // Mock PDF.js to throw an error
    require('pdfjs-dist').getDocument.mockImplementationOnce(() => {
      throw new Error('Failed to load PDF');
    });
    
    render(
      <TextExtractor 
        onComplete={mockOnComplete}
        onProgress={mockOnProgress}
      />
    );
    
    // Select PDF format
    fireEvent.change(screen.getByLabelText('File format'), { target: { value: 'pdf' } });
    
    // Upload file
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText('Select file');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Should show error
    await waitFor(() => {
      expect(screen.getByText('Error extracting text: Failed to load PDF')).toBeInTheDocument();
    });
  });
  
  test('extracts paragraph structure properly', async () => {
    // Mock the text content to include paragraph breaks
    const mockFileReader = {
      onload: null,
      readAsText: jest.fn(function() {
        this.onload({
          target: {
            result: 'Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.'
          }
        });
      })
    };
    global.FileReader = jest.fn(() => mockFileReader);
    
    render(
      <TextExtractor 
        onComplete={mockOnComplete}
        onProgress={mockOnProgress}
      />
    );
    
    // Select TXT format
    fireEvent.change(screen.getByLabelText('File format'), { target: { value: 'txt' } });
    
    // Upload file
    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText('Select file');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Wait for extraction to complete
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(expect.objectContaining({
        text: ['Paragraph 1.', 'Paragraph 2.', 'Paragraph 3.']
      }));
    });
  });
});
