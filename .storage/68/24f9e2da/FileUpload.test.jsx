import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUpload from '../../../components/book/FileUpload';
import { mockUploadFormData } from '../../__mocks__/mockData';

// Mock functions
const mockOnUploadSuccess = jest.fn();
const mockOnUploadError = jest.fn();

// Mock fetch for file processing API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ 
      success: true, 
      bookId: '4',
      title: mockUploadFormData.title, 
      author: mockUploadFormData.author,
      totalPages: 150
    }),
  })
);

describe('FileUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders file upload form correctly', () => {
    render(
      <FileUpload 
        onUploadSuccess={mockOnUploadSuccess} 
        onUploadError={mockOnUploadError}
      />
    );
    
    // Check if form elements are rendered
    expect(screen.getByText('Upload a Book')).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Author/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText('Choose file')).toBeInTheDocument();
    expect(screen.getByText('Upload Book')).toBeDisabled(); // Should be disabled initially
  });
  
  test('enables upload button when required fields are filled', async () => {
    render(
      <FileUpload 
        onUploadSuccess={mockOnUploadSuccess} 
        onUploadError={mockOnUploadError}
      />
    );
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Title/i), { 
      target: { value: 'Test Book Title' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Author/i), { 
      target: { value: 'Test Author' } 
    });
    
    // Create a mock file
    const file = new File(['test content'], 'test-book.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Choose a file/i);
    
    // Set file to input
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Button should be enabled now
    await waitFor(() => {
      expect(screen.getByText('Upload Book')).not.toBeDisabled();
    });
  });
  
  test('displays selected file name', async () => {
    render(
      <FileUpload 
        onUploadSuccess={mockOnUploadSuccess} 
        onUploadError={mockOnUploadError}
      />
    );
    
    // Create a mock file
    const file = new File(['test content'], 'test-book.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Choose a file/i);
    
    // Set file to input
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Selected file name should be displayed
    await waitFor(() => {
      expect(screen.getByText('test-book.pdf')).toBeInTheDocument();
    });
  });
  
  test('handles file upload success', async () => {
    render(
      <FileUpload 
        onUploadSuccess={mockOnUploadSuccess} 
        onUploadError={mockOnUploadError}
      />
    );
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/Title/i), { 
      target: { value: mockUploadFormData.title } 
    });
    
    fireEvent.change(screen.getByLabelText(/Author/i), { 
      target: { value: mockUploadFormData.author } 
    });
    
    fireEvent.change(screen.getByLabelText(/Description/i), { 
      target: { value: mockUploadFormData.description } 
    });
    
    // Create a mock file
    const file = new File(['test content'], 'test-book.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Choose a file/i);
    
    // Set file to input
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Submit form
    fireEvent.click(screen.getByText('Upload Book'));
    
    // Check loading state
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
    
    // Wait for success
    await waitFor(() => {
      expect(mockOnUploadSuccess).toHaveBeenCalledWith(expect.objectContaining({
        bookId: '4',
        title: mockUploadFormData.title
      }));
    });
  });
  
  test('handles file upload error', async () => {
    // Mock fetch to return error
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ 
          success: false, 
          error: 'File format not supported' 
        }),
      })
    );
    
    render(
      <FileUpload 
        onUploadSuccess={mockOnUploadSuccess} 
        onUploadError={mockOnUploadError}
      />
    );
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/Title/i), { 
      target: { value: mockUploadFormData.title } 
    });
    
    fireEvent.change(screen.getByLabelText(/Author/i), { 
      target: { value: mockUploadFormData.author } 
    });
    
    // Create a mock file
    const file = new File(['test content'], 'test-book.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Choose a file/i);
    
    // Set file to input
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Submit form
    fireEvent.click(screen.getByText('Upload Book'));
    
    // Wait for error handler to be called
    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith('File format not supported');
    });
  });
  
  test('validates file type', async () => {
    render(
      <FileUpload 
        onUploadSuccess={mockOnUploadSuccess} 
        onUploadError={mockOnUploadError}
      />
    );
    
    // Create an invalid file type
    const file = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/Choose a file/i);
    
    // Set file to input
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Only PDF, EPUB, and TXT files are supported/i)).toBeInTheDocument();
    });
    
    // Submit button should remain disabled
    expect(screen.getByText('Upload Book')).toBeDisabled();
  });
  
  test('validates file size', async () => {
    render(
      <FileUpload 
        onUploadSuccess={mockOnUploadSuccess} 
        onUploadError={mockOnUploadError}
      />
    );
    
    // Create a mock large file (101MB)
    const largeFile = {
      name: 'large-file.pdf',
      size: 101 * 1024 * 1024, // 101MB
      type: 'application/pdf'
    };
    
    const fileInput = screen.getByLabelText(/Choose a file/i);
    
    // Set file to input
    Object.defineProperty(fileInput, 'files', {
      value: [largeFile]
    });
    fireEvent.change(fileInput);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/File size exceeds 100MB limit/i)).toBeInTheDocument();
    });
    
    // Submit button should remain disabled
    expect(screen.getByText('Upload Book')).toBeDisabled();
  });
  
  test('clears form after successful upload', async () => {
    render(
      <FileUpload 
        onUploadSuccess={mockOnUploadSuccess} 
        onUploadError={mockOnUploadError}
      />
    );
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/Title/i), { 
      target: { value: mockUploadFormData.title } 
    });
    
    fireEvent.change(screen.getByLabelText(/Author/i), { 
      target: { value: mockUploadFormData.author } 
    });
    
    const file = new File(['test content'], 'test-book.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Choose a file/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Submit form
    fireEvent.click(screen.getByText('Upload Book'));
    
    // Wait for success and form reset
    await waitFor(() => {
      expect(screen.getByLabelText(/Title/i).value).toBe('');
      expect(screen.getByLabelText(/Author/i).value).toBe('');
      expect(screen.queryByText('test-book.pdf')).not.toBeInTheDocument();
    });
  });
});
