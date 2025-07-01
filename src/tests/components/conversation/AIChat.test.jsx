import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import AIChat from '../../../components/conversation/AIChat';
import { mockAIConversations } from '../../__mocks__/mockData';

// Mock setTimeout to speed up tests
jest.useFakeTimers();

describe('AIChat Component', () => {
  const mockBookId = '1';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders initial greeting message', () => {
    render(<AIChat bookId={mockBookId} />);
    
    // Check that initial message appears
    expect(screen.getByText(/Hello! I'm your Genesis AI assistant/)).toBeInTheDocument();
  });
  
  test('can send and receive messages', async () => {
    render(<AIChat bookId={mockBookId} />);
    
    // Type a message
    const inputField = screen.getByPlaceholderText('Ask anything about the book...');
    fireEvent.change(inputField, { target: { value: 'What is the main concept?' } });
    
    // Send the message
    const sendButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(sendButton);
    
    // Check that user message appears
    expect(screen.getByText('What is the main concept?')).toBeInTheDocument();
    
    // Check that typing indicator appears
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    
    // Fast forward to simulate AI response time
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    
    // Check that AI response appears
    await waitFor(() => {
      expect(screen.getByText(/The main concept in this book is/)).toBeInTheDocument();
    });
    
    // Input field should be cleared
    expect(inputField.value).toBe('');
  });
  
  test('matches AI response to appropriate query type', async () => {
    render(<AIChat bookId={mockBookId} />);
    
    // Send a query about examples
    const inputField = screen.getByPlaceholderText('Ask anything about the book...');
    fireEvent.change(inputField, { target: { value: 'Give me some examples from the book' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Fast forward timer
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    
    // Check for example-specific response
    await waitFor(() => {
      expect(screen.getByText(/The book provides several examples/)).toBeInTheDocument();
    });
  });
  
  test('disables send button when input is empty', () => {
    render(<AIChat bookId={mockBookId} />);
    
    const sendButton = screen.getByRole('button', { name: /submit/i });
    expect(sendButton).toBeDisabled();
    
    // Enter text
    const inputField = screen.getByPlaceholderText('Ask anything about the book...');
    fireEvent.change(inputField, { target: { value: 'Hello' } });
    expect(sendButton).not.toBeDisabled();
    
    // Clear text
    fireEvent.change(inputField, { target: { value: '' } });
    expect(sendButton).toBeDisabled();
  });
  
  test('shows suggestion prompts at the bottom', () => {
    render(<AIChat bookId={mockBookId} />);
    
    // Check for suggestion text
    expect(screen.getByText(/Try asking:/)).toBeInTheDocument();
    expect(screen.getByText(/"What is the main concept?"/)).toBeInTheDocument();
  });
  
  test('formats timestamps correctly', () => {
    render(<AIChat bookId={mockBookId} />);
    
    // Initial greeting should have a timestamp
    const initialMessage = screen.getByText(/Hello! I'm your Genesis AI assistant/);
    const messageContainer = initialMessage.closest('div');
    
    // Find timestamp (format: HH:MM)
    const timestamp = messageContainer.querySelector('p:last-child');
    expect(timestamp).toBeInTheDocument();
    
    // Timestamp should match format HH:MM (24-hour or 12-hour depending on locale)
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    expect(timestamp.textContent).toMatch(timeRegex);
  });
  
  test('handles different book IDs with different content responses', async () => {
    // Render with the first book ID
    const { unmount } = render(<AIChat bookId="1" />);
    
    const inputField = screen.getByPlaceholderText('Ask anything about the book...');
    fireEvent.change(inputField, { target: { value: 'What is the main concept?' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/disruptive innovation/)).toBeInTheDocument();
    });
    
    // Unmount and render with a different book ID
    unmount();
    render(<AIChat bookId="2" />);
    
    const newInputField = screen.getByPlaceholderText('Ask anything about the book...');
    fireEvent.change(newInputField, { target: { value: 'What is the main concept?' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/System 1.*System 2/)).toBeInTheDocument();
    });
  });
  
  test('handles form submission by pressing Enter key', async () => {
    render(<AIChat bookId={mockBookId} />);
    
    const inputField = screen.getByPlaceholderText('Ask anything about the book...');
    fireEvent.change(inputField, { target: { value: 'Who is the author?' } });
    fireEvent.keyPress(inputField, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    expect(screen.getByText('Who is the author?')).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Clayton Christensen/)).toBeInTheDocument();
    });
  });
});