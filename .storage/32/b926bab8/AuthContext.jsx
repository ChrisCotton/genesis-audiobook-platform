import React, { createContext, useContext, useState, useEffect } from 'react';

// Create authentication context
const AuthContext = createContext();

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Mock user data
const MOCK_USERS = [
  {
    id: '1',
    email: 'demo@genesis.app',
    password: 'password123',
    displayName: 'Demo User',
    avatar: null,
    createdAt: new Date(2023, 1, 15).toISOString()
  },
  {
    id: '2',
    email: 'jane@example.com',
    password: 'password123',
    displayName: 'Jane Smith',
    avatar: null,
    createdAt: new Date(2023, 3, 10).toISOString()
  }
];

export function AuthProvider({ children }) {
  // State for current user
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for saved user session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('genesisUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing saved user data:", e);
        localStorage.removeItem('genesisUser');
      }
    }
    setLoading(false);
  }, []);

  // Save user data when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('genesisUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('genesisUser');
    }
  }, [currentUser]);

  // Login function
  const login = async (email, password) => {
    // Simulate API request delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(
          (user) => user.email === email && user.password === password
        );
        
        if (user) {
          // Remove password from user object
          const { password, ...userWithoutPassword } = user;
          setCurrentUser(userWithoutPassword);
          resolve(userWithoutPassword);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 800);
    });
  };

  // Register function
  const register = async (email, password, displayName) => {
    // Simulate API request delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if email already exists
        if (MOCK_USERS.some(user => user.email === email)) {
          reject(new Error('Email already in use'));
          return;
        }
        
        // Create new user
        const newUser = {
          id: `${MOCK_USERS.length + 1}`,
          email,
          password,
          displayName,
          avatar: null,
          createdAt: new Date().toISOString()
        };
        
        // Add to mock users (normally would be a database operation)
        MOCK_USERS.push(newUser);
        
        // Remove password from user object for state
        const { password: _, ...userWithoutPassword } = newUser;
        setCurrentUser(userWithoutPassword);
        
        resolve(userWithoutPassword);
      }, 800);
    });
  };

  // Logout function
  const logout = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentUser(null);
        resolve();
      }, 300);
    });
  };

  // Update profile function
  const updateProfile = (updates) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentUser(prevUser => ({
          ...prevUser,
          ...updates
        }));
        resolve();
      }, 500);
    });
  };

  // Context value
  const value = {
    currentUser,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
