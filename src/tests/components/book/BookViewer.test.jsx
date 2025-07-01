import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import BookViewer from '../../../components/book/BookViewer';
import { mockBooks, mockBookContent } from '../../__mocks__/mockData';

// Mock necessary browser APIs
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.play = jest.fn();

// Mock getSelection for text highlighting tests
const mockGetSelection = jest.fn();
window.getSelection = mockGetSelection;

describe('BookViewer Component', () => {
  const mockBook = mockBooks[0];
  const onProgressUpdate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders book content correctly', () => {
    render(<BookViewer book={mockBook} onProgressUpdate={onProgressUpdate} />);
    
    // Check page navigation elements
    expect(screen.getByText(`Page 1 of ${mockBook.totalPages}`)).toBeInTheDocument();
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('Next page')).toBeEnabled();
    
    // Check read/listen mode toggle
    expect(screen.getByText('Read')).toHaveClass('bg-blue-600');
    expect(screen.getByText('Listen')).not.toHaveClass('bg-blue-600');
  });
  
  test('navigation buttons update current page', () => {
    render(<BookViewer book={mockBook} onProgressUpdate={onProgressUpdate} />);
    
    // Click next page button
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(screen.getByText(`Page 2 of ${mockBook.totalPages}`)).toBeInTheDocument();
    
    // Previous page should be enabled now
    expect(screen.getByLabelText('Previous page')).toBeEnabled();
    
    // Click previous page button
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(screen.getByText(`Page 1 of ${mockBook.totalPages}`)).toBeInTheDocument();
  });
  
  test('onProgressUpdate is called when page changes', () => {
    render(<BookViewer book={mockBook} onProgressUpdate={onProgressUpdate} />);
    
    // Click next page button
    fireEvent.click(screen.getByLabelText('Next page'));
    
    // Calculate expected progress
    const expectedProgress = Math.round((2 / mockBook.totalPages) * 100);
    expect(onProgressUpdate).toHaveBeenCalledWith(expectedProgress);
  });
  
  test('toggles between read and listen modes', () => {
    render(<BookViewer book={{...mockBook, hasAudioNarration: true}} onProgressUpdate={onProgressUpdate} />);
    
    // Initial state: read mode
    expect(screen.getByText('Read')).toHaveClass('bg-blue-600');
    expect(screen.getByText('Listen')).not.toHaveClass('bg-blue-600');
    
    // Toggle to listen mode
    fireEvent.click(screen.getByText('Listen'));
    
    // Audio controls should appear
    expect(screen.getByLabelText('Play')).toBeInTheDocument();
    expect(screen.getByText('Read')).not.toHaveClass('bg-blue-600');
    expect(screen.getByText('Listen')).toHaveClass('bg-blue-600');
  });
  
  test('audio player controls work correctly', () => {
    render(<BookViewer book={{...mockBook, hasAudioNarration: true}} onProgressUpdate={onProgressUpdate} />);
    
    // Switch to listen mode
    fireEvent.click(screen.getByText('Listen'));
    
    // Click play button
    fireEvent.click(screen.getByLabelText('Play'));
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    
    // Player state should update (mocking state changes would require more setup)
  });
  
  test('annotation panel can be toggled', () => {
    render(<BookViewer book={mockBook} onProgressUpdate={onProgressUpdate} />);
    
    // Annotation panel should not be visible initially
    expect(screen.queryByText('Notes & Highlights')).not.toBeInTheDocument();
    
    // Click annotation button
    fireEvent.click(screen.getByLabelText('Add annotation'));
    
    // Annotation panel should be visible
    expect(screen.getByText('Notes & Highlights')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a note...')).toBeInTheDocument();
    
    // Close annotation panel
    fireEvent.click(screen.getByLabelText('Close annotation panel'));
    
    // Annotation panel should be hidden
    expect(screen.queryByText('Notes & Highlights')).not.toBeInTheDocument();
  });
  
  test('can add an annotation', () => {
    // Mock text selection
    mockGetSelection.mockImplementation(() => ({
      toString: () => 'Selected text',
      isCollapsed: false
    }));
    
    render(<BookViewer book={mockBook} onProgressUpdate={onProgressUpdate} />);
    
    // Open annotation panel
    fireEvent.click(screen.getByLabelText('Add annotation'));
    
    // Simulate text selection
    fireEvent.mouseUp(screen.getByRole('article', { hidden: true }));
    
    // Type annotation
    fireEvent.change(screen.getByPlaceholderText('Add a note...'), {
      target: { value: 'This is my note' }
    });
    
    // Save annotation
    fireEvent.click(screen.getByText('Save Note'));
    
    // Annotation should appear in the list
    expect(screen.getByText('This is my note')).toBeInTheDocument();
  });
  
  test('playback rate can be changed', () => {
    render(<BookViewer book={{...mockBook, hasAudioNarration: true}} onProgressUpdate={onProgressUpdate} />);
    
    // Switch to listen mode
    fireEvent.click(screen.getByText('Listen'));
    
    // Initial playback rate should be 1x
    expect(screen.getByText('1x')).toBeInTheDocument();
    
    // Increase playback rate
    fireEvent.click(screen.getByLabelText('Increase playback speed'));
    
    // Playback rate should be updated to 1.25x
    expect(screen.getByText('1.25x')).toBeInTheDocument();
  });
  
  test('volume can be adjusted', () => {
    render(<BookViewer book={{...mockBook, hasAudioNarration: true}} onProgressUpdate={onProgressUpdate} />);
    
    // Switch to listen mode
    fireEvent.click(screen.getByText('Listen'));
    
    // Find volume slider
    const volumeSlider = screen.getByLabelText('Volume');
    
    // Change volume
    fireEvent.change(volumeSlider, { target: { value: 50 } });
    
    // Volume should be updated (this would affect the audio element's volume property)
    expect(volumeSlider.value).toBe('50');
  });
});