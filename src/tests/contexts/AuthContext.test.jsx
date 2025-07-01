import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext, AuthProvider, useAuth } from '../../../contexts/AuthContext';
import { mockUsers } from '../../__mocks__/mockData';

// Mock component to test the useAuth hook
const AuthTestComponent = () => {
  const { 
    currentUser, 
    login, 
    logout, 
    register, 
    isAuthenticated, 
    isLoading 
  } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </div>
      <div data-testid="loading-status">
        {isLoading ? 'Loading' : 'Not loading'}
      </div>
      {currentUser && (
        <div data-testid="user-info">
          <p data-testid="user-email">{currentUser.email}</p>
          <p data-testid="user-name">{currentUser.displayName}</p>
        </div>
      )}
      <button 
        data-testid="login-button" 
        onClick={() => login('test@example.com', 'password123')}
      >
        Login
      </button>
      <button 
        data-testid="register-button" 
        onClick={() => register('new@example.com', 'password123', 'New User')}
      >
        Register
      </button>
      <button 
        data-testid="logout-button" 
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  test('provides initial authentication state correctly', () => {
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );
    
    // Initially should be loading and not authenticated
    expect(screen.getByTestId('loading-status')).toHaveTextContent('Loading');
    
    // Wait for loading to complete
    act(() => {
      jest.runAllTimers();
    });
    
    // After loading, should not be authenticated by default
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
  });
  
  test('login function authenticates the user', async () => {
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
    });
    
    // Click login button
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Should show loading state during authentication
    expect(screen.getByTestId('loading-status')).toHaveTextContent('Loading');
    
    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
    });
    
    // Should now be authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });
  
  test('logout function clears user authentication', async () => {
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );
    
    // Login first
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Wait for authentication
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Then logout
    fireEvent.click(screen.getByTestId('logout-button'));
    
    // Should now be logged out
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
  });
  
  test('register function creates and authenticates new user', async () => {
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );
    
    // Register a new user
    fireEvent.click(screen.getByTestId('register-button'));
    
    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
    });
    
    // Should now be authenticated as the new user
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('new@example.com');
    expect(screen.getByTestId('user-name')).toHaveTextContent('New User');
  });
  
  test('persists authentication state across reloads', async () => {
    // Mock localStorage to simulate persistence
    const mockUser = mockUsers[0];
    localStorage.setItem('genesis_user', JSON.stringify(mockUser));
    
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
    });
    
    // Should be authenticated with stored user
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email);
    expect(screen.getByTestId('user-name')).toHaveTextContent(mockUser.displayName);
  });
  
  test('handles login errors correctly', async () => {
    // Create a mock implementation with an error case
    const mockAuthContext = {
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn().mockRejectedValue(new Error('Invalid credentials')),
      logout: jest.fn(),
      register: jest.fn(),
    };
    
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <AuthTestComponent />
      </AuthContext.Provider>
    );
    
    // Try to login
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Should remain not authenticated after error
    await waitFor(() => {
      expect(mockAuthContext.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    });
  });
});